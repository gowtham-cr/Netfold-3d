/**
 * Mathematical Expression & Multilingual Speech Normalizer + Sentence/Word Splitter.
 * Converts mathematical formulas, symbols, superscripts, fractions, decimals, units,
 * and UI acronyms into natural spoken explanations in English, Kannada, Tamil, Telugu, and Hindi.
 */

const LANG_MATH_VOCAB = Object.freeze({
  en: {
    pi: 'pi',
    radius: 'radius',
    height: 'height',
    slantHeight: 'slant height',
    length: 'length',
    breadth: 'breadth',
    side: 'side',
    diameter: 'diameter',
    volume: 'volume',
    tsa: 'total surface area',
    csa: 'curved surface area',
    lsa: 'lateral surface area',
    squared: 'squared',
    cubed: 'cubed',
    times: 'times',
    dividedBy: 'by',
    plus: 'plus',
    minus: 'minus',
    equals: 'equals',
    approx: 'approximately equals',
    sqrtOf: 'square root of',
    percent: 'percent',
    point: 'point',
    oneThird: 'one third',
    twoThirds: 'two thirds',
    fourThirds: 'four thirds',
    oneHalf: 'one half',
    sqCm: 'square centimeters',
    cuCm: 'cubic centimeters',
    sqM: 'square meters',
    cuM: 'cubic meters',
    cm: 'centimeters',
    m: 'meters',
    liters: 'liters',
    ncert: 'N C E R T',
    pyq: 'previous year question',
    threeD: '3 D',
    twoD: '2 D',
  },
  kn: {
    pi: 'ಪೈ',
    radius: 'ತ್ರಿಜ್ಯ',
    height: 'ಎತ್ತರ',
    slantHeight: 'ಓರೆ ಎತ್ತರ',
    length: 'ಉದ್ದ',
    breadth: 'ಅಗಲ',
    side: 'ಬಾಹು',
    diameter: 'ವ್ಯಾಸ',
    volume: 'ಘನಫಲ',
    tsa: 'ಒಟ್ಟು ಮೇಲ್ಮೈ ವಿಸ್ತೀರ್ಣ',
    csa: 'ವಕ್ರ ಮೇಲ್ಮೈ ವಿಸ್ತೀರ್ಣ',
    lsa: 'ಪಾರ್ಶ್ವ ಮೇಲ್ಮೈ ವಿಸ್ತೀರ್ಣ',
    squared: 'ವರ್ಗ',
    cubed: 'ಘನ',
    times: 'ಗುಣಿಸು',
    dividedBy: 'ಭಾಗಿಸು',
    plus: 'ಕೂಡಿಸು',
    minus: 'ಕಳೆ',
    equals: 'ಸಮ',
    approx: 'ಸುಮಾರು ಸಮ',
    sqrtOf: 'ವರ್ಗಮೂಲ',
    percent: 'ಶೇಕಡಾ',
    point: 'ದಶಾಂಶ',
    oneThird: 'ಮೂರನೇ ಒಂದು ಭಾಗ',
    twoThirds: 'ಮೂರನೇ ಎರಡು ಭಾಗ',
    fourThirds: 'ನಾಲ್ಕು ಭಾಗಿಸು ಮೂರು',
    oneHalf: 'ಅರ್ಧ',
    sqCm: 'ಚದರ ಸೆಂಟಿಮೀಟರ್',
    cuCm: 'ಘನ ಸೆಂಟಿಮೀಟರ್',
    sqM: 'ಚದರ ಮೀಟರ್',
    cuM: 'ಘನ ಮೀಟರ್',
    cm: 'ಸೆಂಟಿಮೀಟರ್',
    m: 'ಮೀಟರ್',
    liters: 'ಲೀಟರ್',
    ncert: 'ಎನ್ ಸಿ ಇ ಆರ್ ಟಿ',
    pyq: 'ಹಿಂದಿನ ವರ್ಷದ ಪ್ರಶ್ನೆ',
    threeD: 'ಮೂರು ಆಯಾಮದ',
    twoD: 'ಎರಡು ಆಯಾಮದ',
  },
  ta: {
    pi: 'பை',
    radius: 'ஆரம்',
    height: 'உயரம்',
    slantHeight: 'சாய்வு உயரம்',
    length: 'நீளம்',
    breadth: 'அகலம்',
    side: 'பக்கம்',
    diameter: 'விட்டம்',
    volume: 'கன அளவு',
    tsa: 'மொத்த புறப்பரப்பளவு',
    csa: 'வளைந்த புறப்பரப்பளவு',
    lsa: 'பக்கவாட்டு பரப்பளவு',
    squared: 'வர்க்கம்',
    cubed: 'கனம்',
    times: 'பெருக்கல்',
    dividedBy: 'வகுத்தல்',
    plus: 'கூட்டல்',
    minus: 'கழித்தல்',
    equals: 'சமம்',
    approx: 'சுமார்',
    sqrtOf: 'வர்க்கமூலம்',
    percent: 'சதவீதம்',
    point: 'புள்ளி',
    oneThird: 'மூன்றில் ஒன்று',
    twoThirds: 'மூன்றில் இரண்டு',
    fourThirds: 'நான்கு கீழ் மூன்று',
    oneHalf: 'அரை',
    sqCm: 'சதுர சென்டிமீட்டர்',
    cuCm: 'கன சென்டிமீட்டர்',
    sqM: 'சதுர மீட்டர்',
    cuM: 'கன மீட்டர்',
    cm: 'சென்டிமீட்டர்',
    m: 'மீட்டர்',
    liters: 'லிட்டர்',
    ncert: 'என் சி இ ஆர் டி',
    pyq: 'முந்தைய ஆண்டு வினா',
    threeD: 'முப்பரிமாண',
    twoD: 'இருபரிமாண',
  },
  te: {
    pi: 'పై',
    radius: 'వ్యాసార్ధం',
    height: 'ఎత్తు',
    slantHeight: 'వాలు ఎత్తు',
    length: 'పొడవు',
    breadth: 'వెడల్పు',
    side: 'భుజం',
    diameter: 'వ్యాసం',
    volume: 'ఘనపరిమాణం',
    tsa: 'సంపూర్ణ ఉపరితల వైశాల్యం',
    csa: 'వక్రతల వైశాల్యం',
    lsa: 'పార్శ్వ ఉపరితల వైశాల్యం',
    squared: 'వర్గం',
    cubed: 'ఘనం',
    times: 'గుణకారం',
    dividedBy: 'బై',
    plus: 'ప్లస్',
    minus: 'మైనస్',
    equals: 'సమానం',
    approx: 'సుమారు',
    sqrtOf: 'వర్గమూలం',
    percent: 'శాతం',
    point: 'పాయింట్',
    oneThird: 'మూడింట ఒకటి',
    twoThirds: 'మూడింట రెండు',
    fourThirds: 'నాలుగు బై మూడు',
    oneHalf: 'సగం',
    sqCm: 'చదరపు సెంటీమీటర్',
    cuCm: 'ఘన సెంటీమీటర్',
    sqM: 'చదరపు మీటర్',
    cuM: 'ఘన మీటర్',
    cm: 'సెంటీమీటర్',
    m: 'మీటర్',
    liters: 'లీటర్లు',
    ncert: 'ఎన్ సి ఇ ఆర్ టి',
    pyq: 'గత సంవత్సరం ప్రశ్న',
    threeD: 'త్రిమితీయ',
    twoD: 'ద్విమితీయ',
  },
  hi: {
    pi: 'पाई',
    radius: 'त्रिज्या',
    height: 'ऊँचाई',
    slantHeight: 'तिर्यक ऊँचाई',
    length: 'लंबाई',
    breadth: 'चौड़ाई',
    side: 'भुजा',
    diameter: 'व्यास',
    volume: 'आयतन',
    tsa: 'संपूर्ण पृष्ठीय क्षेत्रफल',
    csa: 'वक्र पृष्ठीय क्षेत्रफल',
    lsa: 'पार्श्व पृष्ठीय क्षेत्रफल',
    squared: 'का वर्ग',
    cubed: 'का घन',
    times: 'गुणा',
    dividedBy: 'बटे',
    plus: 'जोड़',
    minus: 'घटा',
    equals: 'बराबर',
    approx: 'लगभग बराबर',
    sqrtOf: 'का वर्गमूल',
    percent: 'प्रतिशत',
    point: 'दशमलव',
    oneThird: 'एक तिहाई',
    twoThirds: 'दो तिहाई',
    fourThirds: 'चार बटे तीन',
    oneHalf: 'आधा',
    sqCm: 'वर्ग सेंटीमीटर',
    cuCm: 'घन सेंटीमीटर',
    sqM: 'वर्ग मीटर',
    cuM: 'घन मीटर',
    cm: 'सेंटीमीटर',
    m: 'मीटर',
    liters: 'लीटर',
    ncert: 'एन सी ई आर टी',
    pyq: 'पिछले वर्ष का प्रश्न',
    threeD: 'त्रि-आयामी',
    twoD: 'द्वि-आयामी',
  },
})

function stripNonSpokenDecorations(raw) {
  return String(raw ?? '')
    .replace(/[\u{1F300}-\u{1FAFF}\u{2600}-\u{27BF}]/gu, ' ')
    .replace(/[✓✕•►▶◀⏸⏹↻]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()
}

/**
 * Converts mathematical notation, variables, equations, units, fractions, and symbols
 * into clear natural spoken text in the target language (`en`, `kn`, `ta`, `te`, `hi`).
 */
export function formatMathForSpeech(rawText, language = 'en') {
  const v = LANG_MATH_VOCAB[language] ?? LANG_MATH_VOCAB.en
  let s = stripNonSpokenDecorations(rawText)
  if (!s) return ''

  // Expand well-known mensuration composite/core equations before generic token passes
  // Avoid leading \b before non-ASCII symbols like π so Unicode formulas always match cleanly.
  const commonFormulas = [
    [/2πr\s*\(\s*r\s*\+\s*h\s*\)/gi, ` 2 ${v.times} ${v.pi} ${v.times} ${v.radius} ${v.times} (${v.radius} ${v.plus} ${v.height}) `],
    [/πr²h(?![a-zA-Z0-9])/gi, ` ${v.pi} ${v.times} ${v.radius} ${v.squared} ${v.times} ${v.height} `],
    [/πr²(?![a-zA-Z0-9])/gi, ` ${v.pi} ${v.times} ${v.radius} ${v.squared} `],
    [/2πrh(?![a-zA-Z0-9])/gi, ` 2 ${v.times} ${v.pi} ${v.times} ${v.radius} ${v.times} ${v.height} `],
    [/4πr²(?![a-zA-Z0-9])/gi, ` 4 ${v.times} ${v.pi} ${v.times} ${v.radius} ${v.squared} `],
    [/3πr²(?![a-zA-Z0-9])/gi, ` 3 ${v.times} ${v.pi} ${v.times} ${v.radius} ${v.squared} `],
    [/2πr²(?![a-zA-Z0-9])/gi, ` 2 ${v.times} ${v.pi} ${v.times} ${v.radius} ${v.squared} `],
    [/πrl(?![a-zA-Z0-9])/gi, ` ${v.pi} ${v.times} ${v.radius} ${v.times} ${v.slantHeight} `],
    [/\b6a²/gi, ` 6 ${v.times} ${v.side} ${v.squared} `],
    [/\b4a²/gi, ` 4 ${v.times} ${v.side} ${v.squared} `],
    [/\ba³(?![a-zA-Z0-9])/gi, ` ${v.side} ${v.cubed} `],
    [/\br³(?![a-zA-Z0-9])/gi, ` ${v.radius} ${v.cubed} `],
    [/\br²(?![a-zA-Z0-9])/gi, ` ${v.radius} ${v.squared} `],
    [/\ba²(?![a-zA-Z0-9])/gi, ` ${v.side} ${v.squared} `],
    [/\bh²(?![a-zA-Z0-9])/gi, ` ${v.height} ${v.squared} `],
    [/\bl\s*×\s*b\s*×\s*h\b/gi, ` ${v.length} ${v.times} ${v.breadth} ${v.times} ${v.height} `],
    [/2\s*\(\s*lb\s*\+\s*bh\s*\+\s*hl\s*\)/gi, ` 2 ${v.times} (${v.length} ${v.breadth} ${v.plus} ${v.breadth} ${v.height} ${v.plus} ${v.height} ${v.length}) `],
  ]

  for (const [pattern, replacement] of commonFormulas) {
    s = s.replace(pattern, replacement)
  }

  // Units (must run before standalone letter rules)
  s = s
    .replace(/\bcm³/gi, ` ${v.cuCm}`)
    .replace(/\bcm\^3\b/gi, ` ${v.cuCm}`)
    .replace(/\bcm²/gi, ` ${v.sqCm}`)
    .replace(/\bcm\^2\b/gi, ` ${v.sqCm}`)
    .replace(/\bm³/gi, ` ${v.cuM}`)
    .replace(/\bm\^3\b/gi, ` ${v.cuM}`)
    .replace(/\bm²/gi, ` ${v.sqM}`)
    .replace(/\bm\^2\b/gi, ` ${v.sqM}`)
    .replace(/(\d+(?:\.\d+)?)\s*cm\b/gi, `$1 ${v.cm}`)
    .replace(/(\d+(?:\.\d+)?)\s*m\b/gi, `$1 ${v.m}`)
    .replace(/(\d+(?:\.\d+)?)\s*L\b/g, `$1 ${v.liters}`)

  // Unicode & numeric fractions
  s = s
    .replace(/²²⁄₇|22\/7/g, ` 22 ${v.dividedBy} 7 `)
    .replace(/⁴⁄₃|\(?\s*4\s*\/\s*3\s*\)?/g, ` ${v.fourThirds} `)
    .replace(/⅔|2\/3/g, ` ${v.twoThirds} `)
    .replace(/⅓|1\/3/g, ` ${v.oneThird} `)
    .replace(/½|1\/2/g, ` ${v.oneHalf} `)
    .replace(/(\d+)\s*\/\s*(\d+)/g, `$1 ${v.dividedBy} $2`)

  // Powers & Greek & Acronyms
  s = s
    .replace(/π/g, ` ${v.pi} `)
    .replace(/²|\^2\b/g, ` ${v.squared} `)
    .replace(/³|\^3\b/g, ` ${v.cubed} `)
    .replace(/√\(([^)]+)\)/g, ` ${v.sqrtOf} $1 `)
    .replace(/√\s*([a-zA-Z0-9]+)/g, ` ${v.sqrtOf} $1 `)
    .replace(/\bTSA\b/g, ` ${v.tsa} `)
    .replace(/\bCSA\b/g, ` ${v.csa} `)
    .replace(/\bLSA\b/g, ` ${v.lsa} `)
    .replace(/\bNCERT\b/g, ` ${v.ncert} `)
    .replace(/\bPYQs?\b/g, ` ${v.pyq} `)
    .replace(/\b3D\b/g, ` ${v.threeD} `)
    .replace(/\b2D\b/g, ` ${v.twoD} `)

  // Single math variable identifiers followed by = or between spaces/operators
  s = s
    .replace(/\bV\s*=/g, `${v.volume} ${v.equals}`)
    .replace(/\br₁|\br1\b/gi, `${v.radius} 1`)
    .replace(/\br₂|\br2\b/gi, `${v.radius} 2`)
    .replace(/\br\s*=/g, `${v.radius} ${v.equals}`)
    .replace(/\bh\s*=/g, `${v.height} ${v.equals}`)
    .replace(/\bl\s*=/g, `${v.length} ${v.equals}`)
    .replace(/\bb\s*=/g, `${v.breadth} ${v.equals}`)
    .replace(/\ba\s*=/g, `${v.side} ${v.equals}`)
    .replace(/\bd\s*=/g, `${v.diameter} ${v.equals}`)
    .replace(/\bs\s*=/g, `${v.slantHeight} ${v.equals}`)

  // For Indic scripts, expand bare math variable tokens when isolated
  if (language !== 'en') {
    s = s
      .replace(/\bR\b/g, v.radius)
      .replace(/\br\b/g, v.radius)
      .replace(/\bh\b/g, v.height)
      .replace(/\bV\b/g, v.volume)
  }

  // Operators & Decimals & Percentages
  s = s
    .replace(/%/g, ` ${v.percent} `)
    .replace(/(\d+)\.(\d+)/g, (_, intPart, fracPart) => {
      const decWords = fracPart
        .split('')
        .map((d) => numberToSpokenWords(Number(d), language))
        .join(' ')
      return `${numberToSpokenWords(Number(intPart), language)} ${v.point} ${decWords}`
    })
    .replace(/\b(\d+)\b/g, (_, numStr) => numberToSpokenWords(Number(numStr), language))
    .replace(/≈/g, ` ${v.approx} `)
    .replace(/=/g, ` ${v.equals} `)
    .replace(/\+/g, ` ${v.plus} `)
    .replace(/[−×·]/g, (m) => (m === '−' ? ` ${v.minus} ` : ` ${v.times} `))
    .replace(/÷/g, ` ${v.dividedBy} `)
    .replace(/\s+/g, ' ')
    .trim()

  // Remove accidental consecutive duplicate phrases when prose + equation meet (e.g. "volume equals volume equals")
  const volDup = new RegExp(`(${v.volume})(?:\\s+${v.equals})?\\s+\\1`, 'gi')
  s = s.replace(volDup, `$1`).replace(new RegExp(`(${v.volume})\\s+\\1`, 'gi'), '$1')

  return s
}

const ONES_TEENS = {
  en: ['zero', 'one', 'two', 'three', 'four', 'five', 'six', 'seven', 'eight', 'nine', 'ten', 'eleven', 'twelve', 'thirteen', 'fourteen', 'fifteen', 'sixteen', 'seventeen', 'eighteen', 'nineteen'],
  kn: ['ಸೊನ್ನೆ', 'ಒಂದು', 'ಎರಡು', 'ಮೂರು', 'ನಾಲ್ಕು', 'ಐದು', 'ಆರು', 'ಏಳು', 'ಎಂಟು', 'ಒಂಬತ್ತು', 'ಹತ್ತು', 'ಹನ್ನೊಂದು', 'ಹನ್ನೆರಡು', 'ಹದಿಮೂರು', 'ಹದಿನಾಲ್ಕು', 'ಹದಿನೈದು', 'ಹದಿನಾರು', 'ಹದಿನೇಳು', 'ಹದಿನೆಂಟು', 'ಹತ್ತೊಂಬತ್ತು'],
  ta: ['பூஜ்ஜியம்', 'ஒன்று', 'இரண்டு', 'மூன்று', 'நான்கு', 'ஐந்து', 'ஆறு', 'ஏழு', 'எட்டு', 'ஒன்பது', 'பத்து', 'பதினொன்று', 'பன்னிரண்டு', 'பதிமூன்று', 'பதினான்கு', 'பதினைந்து', 'பதினாறு', 'பதினேழு', 'பதினெட்டு', 'பத்தொன்பது'],
  te: ['సున్నా', 'ఒకటి', 'రెండు', 'మూడు', 'నాలుగు', 'ఐదు', 'ఆరు', 'ఏడు', 'ఎనిమిది', 'తొమ్మిది', 'పది', 'పదకొండు', 'పన్నెండు', 'పదమూడు', 'పద్నాలుగు', 'పదిహేను', 'పదహారు', 'పదిహేడు', 'పద్దెనిమిది', 'పందొమ్మిది'],
  hi: ['शून्य', 'एक', 'दो', 'तीन', 'चार', 'पाँच', 'छह', 'सात', 'आठ', 'नौ', 'दस', 'ग्यारह', 'बारह', 'तेरह', 'चौदह', 'पंद्रह', 'सोलह', 'सत्रह', 'अठारह', 'उन्नीस'],
}

const TENS_WORDS = {
  en: ['', '', 'twenty', 'thirty', 'forty', 'fifty', 'sixty', 'seventy', 'eighty', 'ninety'],
  kn: ['', '', 'ಇಪ್ಪತ್ತು', 'ಮೂವತ್ತು', 'ನಲವತ್ತು', 'ಐವತ್ತು', 'ಅರವತ್ತು', 'ಎಪ್ಪತ್ತು', 'ಎಂಬತ್ತು', 'ತೊಂಬತ್ತು'],
  ta: ['', '', 'இருபது', 'முப்பது', 'நாற்பது', 'ஐம்பது', 'அறுபது', 'எழுபது', 'எண்பது', 'தொண்ணூறு'],
  te: ['', '', 'ఇరవై', 'ముప్పై', 'నలభై', 'యాభై', 'అరవై', 'డెబ్బై', 'ఎనభై', 'తొంభై'],
  hi: ['', '', 'बीस', 'तीस', 'चालीस', 'पचास', 'साठ', 'सत्तर', 'अस्सी', 'नब्बे'],
}

const SCALE_WORDS = {
  en: { hundred: 'hundred', thousand: 'thousand' },
  kn: { hundred: 'ನೂರು', thousand: 'ಸಾವಿರ' },
  ta: { hundred: 'நூறு', thousand: 'ஆயிரம்' },
  te: { hundred: 'వందల', thousand: 'వేయి' },
  hi: { hundred: 'सौ', thousand: 'हज़ार' },
}

/**
 * Converts integers (0..99,999, with digit-by-digit fallback above) to native language words
 * so neural TTS never drops digits missing from training token tables.
 */
export function numberToSpokenWords(n, language = 'en') {
  const num = Math.floor(Math.abs(Number(n)))
  if (!Number.isFinite(num)) return ''
  const ones = ONES_TEENS[language] ?? ONES_TEENS.en
  const tens = TENS_WORDS[language] ?? TENS_WORDS.en
  const scale = SCALE_WORDS[language] ?? SCALE_WORDS.en

  if (num < 20) return ones[num]
  if (num < 100) {
    const t = Math.floor(num / 10)
    const o = num % 10
    return o === 0 ? tens[t] : `${tens[t]} ${ones[o]}`
  }
  if (num < 1000) {
    const h = Math.floor(num / 100)
    const rem = num % 100
    const head = h === 1 && language === 'en' ? `one ${scale.hundred}` : `${ones[h]} ${scale.hundred}`
    return rem === 0 ? head : `${head} ${numberToSpokenWords(rem, language)}`
  }
  if (num < 100000) {
    const th = Math.floor(num / 1000)
    const rem = num % 1000
    const head = `${numberToSpokenWords(th, language)} ${scale.thousand}`
    return rem === 0 ? head : `${head} ${numberToSpokenWords(rem, language)}`
  }
  return String(num)
    .split('')
    .map((d) => ones[Number(d)])
    .join(' ')
}

/**
 * Splits spoken text into clean logical sentences while preserving decimal numbers like 3.14.
 */
export function splitIntoSentences(rawText) {
  const cleaned = String(rawText ?? '').replace(/\s+/g, ' ').trim()
  if (!cleaned) return []

  // Protect decimals (3.14) before sentence boundary split
  const sentinel = cleaned.replace(/(\d)\.(\d)/g, '$1__DEC__$2')
  const parts = sentinel
    .split(/(?<=[.!?।])\s+/)
    .map((p) => p.replace(/__DEC__/g, '.').trim())
    .filter(Boolean)

  return parts.length > 0 ? parts : [cleaned]
}

export function splitIntoWords(sentence) {
  return String(sentence ?? '')
    .trim()
    .split(/\s+/)
    .filter(Boolean)
}
