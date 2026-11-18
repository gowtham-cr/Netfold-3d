import { getMultilingualContent } from '../data/multilingualContentTranslations.js'
import { LANGUAGE_OPTIONS, TRANSLATIONS } from '../data/translations.js'
import { SHAPES } from './mathEngine.js'

function fmtVal(v) {
  if (v === null || v === undefined || !Number.isFinite(v)) return '—'
  return Number.isInteger(v) ? String(v) : String(Number(v.toFixed(2)))
}

function getLangDisplayName(code) {
  const opt = LANGUAGE_OPTIONS.find((o) => o.code === code)
  return opt ? opt.nativeLabel : code
}

export function getShapeDisplayName(shape, language = 'en', translations = null) {
  const t = translations ?? TRANSLATIONS[language] ?? TRANSLATIONS.en
  const raw = t.shapes?.[shape]
  if (typeof raw === 'string') return raw
  if (raw && typeof raw.name === 'string') return raw.name
  return shape
}

/**
 * Generates live 5-language explanation (definition, 3D structure intuition, live changed dimensions,
 * formulas, common mistake & spoken narration) whenever any of the 15 shapes or dimensions change.
 */
export function buildShapeMultilingualExplanation(
  shape,
  mensuration,
  unit = 'cm',
  language = 'en',
  translations = null,
) {
  const t = translations ?? TRANSLATIONS[language] ?? TRANSLATIONS.en
  const mc = getMultilingualContent(language)
  const sn = mc.shapeNarrator
  const learn = t.learningByShape?.[shape] ?? TRANSLATIONS.en.learningByShape[shape]
  const shapeLabel = getShapeDisplayName(shape, language, t)
  const lenU = t.unitSymbols?.[unit]?.length ?? unit
  const areaU = t.unitSymbols?.[unit]?.area ?? `${unit}²`
  const volU = t.unitSymbols?.[unit]?.volume ?? `${unit}³`

  const dimsText = Object.entries(mensuration?.dimensions ?? {})
    .map(([k, v]) => `${t.dimensionLabels?.[k] ?? k} = ${fmtVal(v)} ${lenU}`)
    .join(', ')

  const isNoNet = shape === SHAPES.SPHERE || shape === SHAPES.HEMISPHERE
  const structureText = isNoNet ? sn.noCurvedFaceNote : sn.foldNetHint
  const commonMistake = sn.mistakesByShape?.[shape] ?? sn.mistakesByShape.cube

  const lsaStr =
    mensuration?.lsa !== null && mensuration?.lsa !== undefined
      ? `${fmtVal(mensuration.lsa)} ${areaU}`
      : null
  const tsaStr = `${fmtVal(mensuration?.tsa)} ${areaU}`
  const volStr = `${fmtVal(mensuration?.volume)} ${volU}`

  const speakParts = [
    `${shapeLabel}. ${learn?.definition ?? ''}`,
    `${sn.liveChangeNote}: ${dimsText}.`,
    lsaStr ? `${t.highlightModes?.lsa ?? 'LSA'}: ${lsaStr}.` : '',
    `${t.highlightModes?.tsa ?? 'TSA'}: ${tsaStr}.`,
    `${t.highlightModes?.volume ?? 'Volume'}: ${volStr}.`,
    `${learn?.realWorldExample ?? ''}`,
    `${sn.commonMistakeHeading}: ${commonMistake}`,
  ].filter(Boolean)

  return {
    shapeLabel,
    definition: learn?.definition ?? '',
    dimensionsText: dimsText,
    structureText,
    commonMistake,
    workedExample: learn?.workedExample ?? '',
    realWorldExample: learn?.realWorldExample ?? '',
    didYouKnow: learn?.didYouKnow ?? '',
    volumeDisplay: volStr,
    lsaDisplay: lsaStr,
    tsaDisplay: tsaStr,
    speakText: speakParts.join(' '),
  }
}

/**
 * Generates localized formula & substitution speech narration for FormulaCard.
 */
export function buildFormulaMultilingualExplanation(
  shape,
  mensuration,
  unit = 'cm',
  language = 'en',
  translations = null,
) {
  const t = translations ?? TRANSLATIONS[language] ?? TRANSLATIONS.en
  const mc = getMultilingualContent(language)
  const shapeLabel = getShapeDisplayName(shape, language, t)
  const areaU = t.unitSymbols?.[unit]?.area ?? `${unit}²`
  const volU = t.unitSymbols?.[unit]?.volume ?? `${unit}³`

  const parts = [
    `${shapeLabel}. ${t.formulaCardTitle}.`,
    `${mc.shapeNarrator.volumeFormulaLabel}: ${fmtVal(mensuration?.volume)} ${volU}.`,
    mensuration?.lsa !== null && mensuration?.lsa !== undefined
      ? `${mc.shapeNarrator.lsaFormulaLabel}: ${fmtVal(mensuration.lsa)} ${areaU}.`
      : '',
    `${mc.shapeNarrator.tsaFormulaLabel}: ${fmtVal(mensuration?.tsa)} ${areaU}.`,
    mc.shapeNarrator.mistakesByShape?.[shape] ?? '',
  ].filter(Boolean)

  return parts.join(' ')
}

/**
 * Builds localized narrative explanations for Student, Teacher, and Competitive Exam dashboards
 * from actual calculated metrics (never invents missing progress).
 */
export function buildDashboardMultilingualExplanation(
  kind,
  metrics = {},
  language = 'en',
  translations = null,
) {
  const t = translations ?? TRANSLATIONS[language] ?? TRANSLATIONS.en
  const mc = getMultilingualContent(language)
  const dn = mc.dashboardNarrator

  if (kind === 'student') {
    const attempts = metrics.attemptedCount ?? 0
    if (attempts === 0) {
      return {
        title: dn.student.summaryTitle,
        body: dn.student.noAttempts,
        speakText: `${dn.student.summaryTitle}. ${dn.student.noAttempts}`,
        isEmpty: true,
      }
    }
    const trendKey =
      metrics.trendStatus === 'up'
        ? dn.student.trendUp
        : metrics.trendStatus === 'down'
          ? dn.student.trendDown
          : dn.student.trendSteady
    const weakList = metrics.weakTopics ?? []
    const weakName = weakList[0]
      ? t.pyqUi?.topics?.[weakList[0]] ?? weakList[0].replace(/_/g, ' ')
      : null
    const weakText = weakName
      ? dn.student.weakPresent.replace('{weak}', weakName)
      : dn.student.weakNone
    const recText = weakName
      ? dn.student.recPrefix.replace('{target}', weakName)
      : dn.student.recPrefix.replace('{target}', getShapeDisplayName(SHAPES.CYLINDER, language, t))

    const body = dn.student.withAttempts
      .replace('{attempts}', String(attempts))
      .replace('{accuracy}', String(metrics.accuracyPct ?? 0))
      .replace('{correct}', String(metrics.correctCount ?? 0))
      .replace('{incorrect}', String(metrics.incorrectCount ?? 0))
      .replace('{trendText}', trendKey)
      .replace('{weakText}', weakText)
      .replace('{recText}', recText)

    return {
      title: dn.student.summaryTitle,
      body,
      speakText: `${dn.student.summaryTitle}. ${body}`,
      isEmpty: false,
    }
  }

  if (kind === 'teacher') {
    const weakName = metrics.weakestTopic
      ? t.pyqUi?.topics?.[metrics.weakestTopic] ?? metrics.weakestTopic.replace(/_/g, ' ')
      : null
    const weakText = weakName
      ? dn.teacher.weakClass.replace('{weak}', weakName)
      : dn.teacher.weakNone
    const body = dn.teacher.body
      .replace('{rosterCount}', String(metrics.rosterCount ?? 0))
      .replace('{avgScore}', String(metrics.classAverageScore ?? 0))
      .replace('{avgAcc}', String(metrics.classAccuracy ?? 0))
      .replace('{completion}', String(metrics.assignmentCompletionAvg ?? 0))
      .replace('{weakText}', weakText)
      .replace('{actionText}', dn.teacher.actionTip)

    return {
      title: dn.teacher.summaryTitle,
      body,
      speakText: `${dn.teacher.summaryTitle}. ${body}`,
      isEmpty: false,
    }
  }

  // Competitive Exam & Frequency Dashboard
  const topTopicRaw = metrics.mostTestedTopic
  const topTopic = topTopicRaw
    ? t.pyqUi?.topics?.[topTopicRaw] ?? topTopicRaw.replace(/_/g, ' ')
    : 'Mensuration'
  const revRaw = metrics.weakTopics?.[0] ?? topTopicRaw
  const revTopic = revRaw
    ? t.pyqUi?.topics?.[revRaw] ?? revRaw.replace(/_/g, ' ')
    : topTopic

  const body = dn.exam.body
    .replace('{verifiedCount}', String(metrics.verifiedCount ?? 41))
    .replace('{yearsCount}', String(metrics.indexedYearsCount ?? 9))
    .replace('{practiceCount}', String(metrics.practiceCount ?? 138))
    .replace('{topTopic}', topTopic)
    .replace('{readiness}', String(metrics.readinessScore ?? 0))
    .replace('{mocksCount}', String(metrics.mockCount ?? 0))
    .replace('{revTopic}', revTopic)

  return {
    title: dn.exam.summaryTitle,
    body,
    speakText: `${dn.exam.summaryTitle}. ${body}`,
    isEmpty: false,
  }
}

/**
 * Localizes any solved NCERT result dynamically into the active language without altering
 * step indices or mathematical numbers/equations (so switching language preserves question progress).
 */
export function localizeSolvedNcertResult(solved, language = 'en', translations = null) {
  if (!solved || !solved.supported) return solved
  if (language === 'en') return solved

  const mc = getMultilingualContent(language)
  const su = mc.solverStepsUi
  const shapeName = getShapeDisplayName(solved.primaryShape, language, translations)
  const shapeMistake = mc.shapeNarrator?.mistakesByShape?.[solved.primaryShape]

  const localizedSteps = (solved.steps ?? []).map((st, idx) => {
    const localTitle = su.titles?.[idx] ?? st.title
    let prefixNote = ''
    if (idx === 3) {
      prefixNote = `${su.shapeLinePrefix}: ${shapeName}.\n`
    } else if (idx === 4) {
      prefixNote = `${su.formulaReasonPrefix}: ${solved.formulaSummary}\n`
    } else if (idx === 8) {
      prefixNote = `${su.answerPrefix}: ${solved.finalAnswerDisplay}\n`
    }
    return {
      ...st,
      title: localTitle,
      body: `${prefixNote}${st.body}`,
    }
  })

  return {
    ...solved,
    localizedShapeName: shapeName,
    localizedHint: `${su.hintPrefix}: ${solved.studentHint}`,
    localizedCommonMistake: shapeMistake
      ? `${su.mistakePrefix}: ${shapeMistake}`
      : `${su.mistakePrefix}: ${solved.commonMistake}`,
    languageNotice: su.languageSwitchPreservedNotice,
    steps: localizedSteps,
  }
}

/**
 * Builds localized explanation & spoken summary for Competitive Exam Arena questions.
 */
export function buildArenaQuestionMultilingualWrapper(
  question,
  localeObj,
  language = 'en',
  translations = null,
) {
  if (!question) return null
  const t = translations ?? TRANSLATIONS[language] ?? TRANSLATIONS.en
  const mc = getMultilingualContent(language)
  const ae = mc.arenaExplainUi
  const topicName =
    t.pyqUi?.topics?.[question.topic] ?? question.topic?.replace(/_/g, ' ') ?? ''
  const shapeName = question.shape
    ? getShapeDisplayName(question.shape, language, t)
    : ''
  const finalOpt = question.options?.[question.correctIndex] ?? ''
  const stepsText = (localeObj?.solutionSteps ?? []).join(' ')

  const speakText = [
    `${ae.givenTopicLabel}: ${topicName}${shapeName ? ` (${shapeName})` : ''}.`,
    localeObj?.question ?? '',
    `${ae.formulaSelectedLabel}: ${question.formulaUsed ?? ''}.`,
    localeObj?.shortcutTip ? `${ae.shortcutLabel}: ${localeObj.shortcutTip}.` : '',
    `${ae.stepsLabel}: ${stepsText}`,
    `${ae.finalAnswerLabel}: ${finalOpt}.`,
  ]
    .filter(Boolean)
    .join(' ')

  return {
    topicName,
    shapeName,
    langName: getLangDisplayName(language),
    labels: ae,
    speakText,
  }
}
