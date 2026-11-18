import { SHAPES } from '../utils/mathEngine.js'

export const EXAM_TRACKS = Object.freeze([
  'jee_foundation',
  'kcet',
  'ssc',
  'banking',
  'general_aptitude',
])

export const QUESTION_DIFFICULTIES = Object.freeze([
  'easy',
  'medium',
  'advanced',
])

export const QUESTION_TOPICS = Object.freeze([
  'cube_cuboid',
  'cylinder',
  'cone',
  'sphere_hemisphere',
  'prism_pyramid',
  'frustum_octahedron',
  'combinations_conversion',
  'scaling_ratio',
])

export const QUESTION_TYPES = Object.freeze(['mcq', 'numerical'])
export const SYLLABUS_TAGS = Object.freeze(['ncert_core', 'additional_practice'])

const QUESTION_TEMPLATES = Object.freeze([
  {
    id: 'q_jee_1',
    examTrack: 'jee_foundation',
    difficulty: 'easy',
    topic: 'cube_cuboid',
    shape: SHAPES.CUBE,
    questionType: 'mcq',
    syllabusTag: 'ncert_core',
    dimensions: { a: 6 },
    formulaUsed: 'd = a√3, V = a³',
    options: ['108 cm³', '216 cm³', '36√3 cm³', '432 cm³'],
    correctIndex: 1,
    en: {
      question: 'If the space diagonal of a solid cube is 6√3 cm, find its volume.',
      shortcutTip: 'Ignore √3 mentally: diagonal a√3 = 6√3 gives edge a = 6 immediately, so V = 6³ = 216.',
      solutionSteps: [
        'Space diagonal of cube = a√3 = 6√3 cm ⇒ edge a = 6 cm.',
        'Volume V = a³ = 6³ = 216 cm³.',
      ],
    },
    kn: {
      question: 'ಒಂದು ಘನದ ಕರ್ಣವು 6√3 ಸೆಂ.ಮೀ ಆದರೆ, ಅದರ ಘನಫಲವನ್ನು ಕಂಡುಹಿಡಿಯಿರಿ.',
      shortcutTip: 'a√3 = 6√3 ನಿಂದ ತಕ್ಷಣ ಅಂಚು a = 6 ಸಿಗುತ್ತದೆ, ಆದ್ದರಿಂದ V = 6³ = 216.',
      solutionSteps: ['ಘನದ ಕರ್ಣ a√3 = 6√3 ⇒ a = 6 ಸೆಂ.ಮೀ.', 'ಘನಫಲ = 6³ = 216 ಸೆಂ.ಮೀ³.'],
    },
    ta: {
      question: 'ஒரு கனசதுரத்தின் மூலைவிட்டம் 6√3 செ.மீ எனில், அதன் கன அளவு என்ன?',
      shortcutTip: 'a√3 = 6√3 என்பதால் பக்கம் a = 6; எனவே V = 6³ = 216.',
      solutionSteps: ['மூலைவிட்டம் a√3 = 6√3 ⇒ a = 6 செ.மீ.', 'கன அளவு = 6³ = 216 செ.மீ³.'],
    },
    te: {
      question: 'ఒక ఘనం కర్ణం 6√3 సెం.మీ అయితే, దాని ఘనపరిమాణం ఎంత?',
      shortcutTip: 'a√3 = 6√3 నుండి అంచు a = 6 వస్తుంది, కాబట్టి V = 6³ = 216.',
      solutionSteps: ['ఘనం కర్ణం a√3 = 6√3 ⇒ a = 6 సెం.మీ.', 'ఘనపరిమాణం = 6³ = 216 సెం.మీ³.'],
    },
    hi: {
      question: 'यदि एक घन का विकर्ण 6√3 सेमी है, तो उसका आयतन ज्ञात कीजिए।',
      shortcutTip: 'a√3 = 6√3 से तुरंत भुजा a = 6 मिलती है, अतः V = 6³ = 216।',
      solutionSteps: ['घन का विकर्ण a√3 = 6√3 ⇒ a = 6 सेमी।', 'आयतन = 6³ = 216 सेमी³।'],
    },
  },
  {
    id: 'q_jee_2',
    examTrack: 'jee_foundation',
    difficulty: 'medium',
    topic: 'cone',
    shape: SHAPES.CONE,
    questionType: 'mcq',
    syllabusTag: 'additional_practice',
    dimensions: { r: 3, h: 5 },
    formulaUsed: 'CSA = πrl, Base = πr², l² = r² + h²',
    options: ['√3 : 1', '2 : 1', '1 : √2', '3 : 1'],
    correctIndex: 0,
    en: {
      question: 'The curved surface area of a right circular cone equals twice the area of its circular base. Find the ratio of height to radius (h : r).',
      shortcutTip: 'πrl = 2πr² ⇒ l = 2r. In a 30-60-90 right triangle with hypotenuse 2r and base r, h = √3 r!',
      solutionSteps: [
        'Given CSA = 2 × Base Area ⇒ πrl = 2πr² ⇒ l = 2r.',
        'h² = l² − r² = 4r² − r² = 3r² ⇒ h = √3 r ⇒ h : r = √3 : 1.',
      ],
    },
    kn: {
      question: 'ಶಂಕುವಿನ ವಕ್ರ ಮೇಲ್ಮೈ ವಿಸ್ತೀರ್ಣವು ಅದರ ಪಾದದ ವಿಸ್ತೀರ್ಣದ ಎರಡರಷ್ಟಿದೆ. ಎತ್ತರ ಮತ್ತು ತ್ರಿಜ್ಯದ ಅನುಪಾತ (h : r) ಕಂಡುಹಿಡಿಯಿರಿ.',
      shortcutTip: 'πrl = 2πr² ⇒ l = 2r ಆಗುವುದರಿಂದ h = √(4r² − r²) = √3 r.',
      solutionSteps: ['πrl = 2πr² ⇒ l = 2r.', 'h = √(l² − r²) = √3 r ⇒ h : r = √3 : 1.'],
    },
    ta: {
      question: 'கூம்பின் வளைபரப்பு அதன் அடிப்பரப்பின் இரு மடங்கிற்குச் சமம் எனில் உயரம் : ஆரம் (h : r) விகிதம் காண்க.',
      shortcutTip: 'πrl = 2πr² ⇒ l = 2r என்பதால் h = √(4r² − r²) = √3 r ஆகும்.',
      solutionSteps: ['πrl = 2πr² ⇒ l = 2r.', 'h = √(4r² − r²) = √3 r ⇒ h : r = √3 : 1.'],
    },
    te: {
      question: 'శంఖువు వక్రతల వైశాల్యం దాని భూమి వైశాల్యానికి రెట్టింపు అయితే ఎత్తు : వ్యాసార్థం (h : r) కనుగొనండి.',
      shortcutTip: 'πrl = 2πr² ⇒ l = 2r కాబట్టి h = √(4r² − r²) = √3 r.',
      solutionSteps: ['πrl = 2πr² ⇒ l = 2r.', 'h = √(l² − r²) = √3 r ⇒ h : r = √3 : 1.'],
    },
    hi: {
      question: 'एक लंब वृत्तीय शंकु का वक्र पृष्ठीय क्षेत्रफल उसके आधार क्षेत्रफल का दोगुना है। ऊँचाई और त्रिज्या का अनुपात (h : r) ज्ञात करें।',
      shortcutTip: 'πrl = 2πr² ⇒ l = 2r, अतः समकोण त्रिभुज से h = √(4r² − r²) = √3 r!',
      solutionSteps: ['πrl = 2πr² ⇒ l = 2r।', 'h = √(l² − r²) = √3 r ⇒ h : r = √3 : 1।'],
    },
  },
  {
    id: 'q_jee_3',
    examTrack: 'jee_foundation',
    difficulty: 'advanced',
    topic: 'sphere_hemisphere',
    shape: SHAPES.SPHERE,
    questionType: 'mcq',
    syllabusTag: 'ncert_core',
    dimensions: { r: 6 },
    formulaUsed: 'N = V_large / V_small = (R / r)³',
    options: ['9', '18', '27', '36'],
    correctIndex: 2,
    en: {
      question: 'A solid metallic sphere of radius 6 cm is melted and recast into identical small spheres of radius 2 cm. How many small spheres are formed?',
      shortcutTip: 'Skip (4/3)π completely! For identical shape recasting, N = (R / r)³ = (6 / 2)³ = 3³ = 27.',
      solutionSteps: [
        'Total volume remains conserved: N × (4/3)πr³ = (4/3)πR³.',
        'N = (R / r)³ = (6 / 2)³ = 27 small spheres.',
      ],
    },
    kn: {
      question: '6 ಸೆಂ.ಮೀ ತ್ರಿಜ್ಯದ ಲೋಹದ ಗೋಳವನ್ನು ಕರಗಿಸಿ 2 ಸೆಂ.ಮೀ ತ್ರಿಜ್ಯದ ಎಷ್ಟು ಸಣ್ಣ ಗೋಳಗಳನ್ನು ತಯಾರಿಸಬಹುದು?',
      shortcutTip: '(4/3)π ಬಿಟ್ಟು ನೇರವಾಗಿ N = (R / r)³ = (6 / 2)³ = 27 ಲೆಕ್ಕಹಾಕಿ.',
      solutionSteps: ['N = (R / r)³.', 'N = (6 / 2)³ = 3³ = 27 ಗೋಳಗಳು.'],
    },
    ta: {
      question: '6 செ.மீ ஆரமுள்ள உலோகக் கோளத்தை உருக்கி 2 செ.மீ ஆரமுள்ள எத்தனை சிறிய கோளங்கள் செய்யலாம்?',
      shortcutTip: '(4/3)π-ஐத் தவிர்த்து N = (R / r)³ = (6 / 2)³ = 27 என விரைவாகக் காண்க.',
      solutionSteps: ['கன அளவு மாறாது: N = (R / r)³.', 'N = (6 / 2)³ = 27 சிறிய கோளங்கள்.'],
    },
    te: {
      question: '6 సెం.మీ వ్యాసార్థం గల లోహ గోళాన్ని కరిగించి 2 సెం.మీ వ్యాసార్థం గల ఎన్ని చిన్న గోళాలు చేయవచ్చు?',
      shortcutTip: '(4/3)π వదిలి N = (R / r)³ = (6 / 2)³ = 27 వేగంగా కనుగొనండి.',
      solutionSteps: ['N = (R / r)³.', 'N = 3³ = 27 చిన్న గోళాలు.'],
    },
    hi: {
      question: '6 सेमी त्रिज्या वाले ठोस गोले को पिघलाकर 2 सेमी त्रिज्या वाले कितने छोटे गोले बनाए जा सकते हैं?',
      shortcutTip: '(4/3)π काटें: N = (R / r)³ = (6 / 2)³ = 3³ = 27 सीधे उत्तर!',
      solutionSteps: ['आयतन समान रहने से N = (R / r)³।', 'N = (6 / 2)³ = 27 छोटे गोले।'],
    },
  },
  {
    id: 'q_jee_4',
    examTrack: 'jee_foundation',
    difficulty: 'medium',
    topic: 'combinations_conversion',
    shape: SHAPES.CYLINDER,
    questionType: 'mcq',
    syllabusTag: 'ncert_core',
    dimensions: { r: 3, h: 6 },
    formulaUsed: 'V_cone = ⅓ V_cylinder ⇒ Remaining = ⅔',
    options: ['1/3', '1/2', '2/3', '3/4'],
    correctIndex: 2,
    en: {
      question: 'From a solid right circular cylinder, the largest possible cone with the same base and height is carved out. What fraction of the original volume remains?',
      shortcutTip: 'A cone takes exactly 1/3 of a matching cylinder, leaving 1 − 1/3 = 2/3 unconditionally.',
      solutionSteps: [
        'V_cylinder = πr²h and V_cone = ⅓πr²h.',
        'Remaining fraction = (πr²h − ⅓πr²h) / πr²h = 2/3.',
      ],
    },
    kn: {
      question: 'ಒಂದು ಸಿಲಿಂಡರ್‌ನಿಂದ ಅದೇ ಪಾದ ಮತ್ತು ಎತ್ತರದ ಅತಿ ದೊಡ್ಡ ಶಂಕುವನ್ನು ಕೊರೆದು ತೆಗೆದರೆ ಉಳಿಯುವ ಘನಫಲದ ಭಿನ್ನರಾಶಿ ಎಷ್ಟು?',
      shortcutTip: 'ಶಂಕುವಿನ ಘನಫಲ ಸಿಲಿಂಡರ್‌ನ 1/3 ಆಗಿರುವುದರಿಂದ ಉಳಿಯುವುದು 1 − 1/3 = 2/3.',
      solutionSteps: ['ಶಂಕು = ⅓ சி.ಘ.', 'ಉಳಿದ ಭಾಗ = 1 − ⅓ = 2/3.'],
    },
    ta: {
      question: 'ஒரு திண்ம உருளையிலிருந்து அதே அடி மற்றும் உயரமுள்ள மிகப்பெரிய கூம்பு வெட்டி எடுக்கப்பட்டால் மீதமுள்ள கன அளவின் பின்னம் என்ன?',
      shortcutTip: 'கூம்பு உருளையில் 1/3 பங்கு என்பதால் மீதம் 1 − 1/3 = 2/3 ஆகும்.',
      solutionSteps: ['கூம்பு = ⅓ உருளை.', 'மீதமுள்ள பின்னம் = 1 − ⅓ = 2/3.'],
    },
    te: {
      question: 'ఒక స్థూపం నుండి అదే భూమి మరియు ఎత్తు గల అతిపెద్ద శంఖువును చెక్కి తీసివేస్తే మిగిలే ఘనపరిమాణ భాగం ఎంత?',
      shortcutTip: 'శంఖువు 1/3 భాగం తీసివేస్తుంది కాబట్టి మిగిలేది 1 − 1/3 = 2/3.',
      solutionSteps: ['V_cone = ⅓ V_cylinder.', 'మిగిలిన భాగం = 1 − ⅓ = 2/3.'],
    },
    hi: {
      question: 'एक ठोस बेलन में से समान आधार और ऊँचाई का सबसे बड़ा शंकु काटकर निकाला जाए, तो मूल आयतन का कितना अंश शेष बचेगा?',
      shortcutTip: 'शंकु बेलन का ठीक 1/3 होता है, अतः शेष भाग हमेशा 1 − 1/3 = 2/3 बचेगा।',
      solutionSteps: ['V_शंकु = ⅓ V_बेलन।', 'शेष भाग = 1 − ⅓ = 2/3।'],
    },
  },
  {
    id: 'q_jee_5',
    examTrack: 'jee_foundation',
    difficulty: 'advanced',
    topic: 'frustum_octahedron',
    shape: SHAPES.FRUSTUM,
    questionType: 'numerical',
    syllabusTag: 'ncert_core',
    dimensions: { r1: 6, r2: 2, h: 3 },
    formulaUsed: 'l = √(h² + (r₁ − r₂)²)',
    options: ['4 cm', '5 cm', '7 cm', '√13 cm'],
    correctIndex: 1,
    en: {
      question: 'A frustum of a cone has radii 6 cm and 2 cm, and vertical height 3 cm. Find its slant height l.',
      shortcutTip: 'Notice Δr = 6 − 2 = 4 and h = 3 — an instant 3-4-5 Pythagorean triple giving l = 5!',
      solutionSteps: [
        'Radius difference Δr = r₁ − r₂ = 6 − 2 = 4 cm.',
        'l = √(h² + (Δr)²) = √(3² + 4²) = √25 = 5 cm.',
      ],
    },
    kn: {
      question: 'ಒಂದು ಶಂಕು ಭಿನ್ನಕದ ತ್ರಿಜ್ಯಗಳು 6 ಸೆಂ.ಮೀ, 2 ಸೆಂ.ಮೀ ಮತ್ತು ಎತ್ತರ 3 ಸೆಂ.ಮೀ ಆದರೆ ಓರೆ ಎತ್ತರ l ಎಷ್ಟು?',
      shortcutTip: 'Δr = 6 − 2 = 4 ಮತ್ತು h = 3 ⇒ 3-4-5 ತ್ರಿವಳಿಯಿಂದ ನೇರವಾಗಿ l = 5 ಸೆಂ.ಮೀ!',
      solutionSteps: ['r₁ − r₂ = 4 ಸೆಂ.ಮೀ.', 'l = √(3² + 4²) = 5 ಸೆಂ.ಮೀ.'],
    },
    ta: {
      question: 'ஒரு கூம்பின் இடைக்கண்டத்தின் ஆரங்கள் 6 செ.மீ, 2 செ.மீ மற்றும் உயரம் 3 செ.மீ எனில் சாயுயரம் l காண்க.',
      shortcutTip: 'r₁ − r₂ = 4, h = 3 ⇒ 3-4-5 பிதாகரஸ் மூன்றி மூலம் l = 5 செ.மீ!',
      solutionSteps: ['r₁ − r₂ = 6 − 2 = 4 செ.மீ.', 'l = √(3² + 4²) = 5 செ.மீ.'],
    },
    te: {
      question: 'శంఖు ఛిన్నకం వ్యాసార్థాలు 6 సెం.మీ, 2 సెం.మీ మరియు ఎత్తు 3 సెం.మీ అయితే ఏటవాలు ఎత్తు l ఎంత?',
      shortcutTip: 'r₁ − r₂ = 4, h = 3 ⇒ 3-4-5 త్రికంతో l = 5 సెం.మీ!',
      solutionSteps: ['Δr = 6 − 2 = 4 సెం.మీ.', 'l = √(3² + 4²) = 5 సెం.మీ.'],
    },
    hi: {
      question: 'एक शंकु छिन्नक की त्रिज्याएँ 6 सेमी व 2 सेमी तथा ऊँचाई 3 सेमी है। इसकी तिर्यक ऊँचाई l ज्ञात कीजिए।',
      shortcutTip: 'Δr = 6 − 2 = 4 और h = 3 ⇒ 3-4-5 त्रिक से सीधे l = 5 सेमी!',
      solutionSteps: ['r₁ − r₂ = 6 − 2 = 4 सेमी।', 'l = √(3² + 4²) = 5 सेमी।'],
    },
  },

  // ---------------- KCET TRACK ----------------
  {
    id: 'q_kcet_1',
    examTrack: 'kcet',
    difficulty: 'easy',
    topic: 'scaling_ratio',
    shape: SHAPES.SPHERE,
    questionType: 'mcq',
    syllabusTag: 'additional_practice',
    dimensions: { r: 4 },
    formulaUsed: 'A ∝ r² ⇒ % change = (k² − 1) × 100%',
    options: ['100%', '200%', '300%', '400%'],
    correctIndex: 2,
    en: {
      question: 'If the radius of a sphere is increased by 100%, by what percentage does its total surface area increase?',
      shortcutTip: '100% increase means k = 2. Area scales by k² = 4 times, so net increase = (4 − 1) × 100% = 300%!',
      solutionSteps: [
        'New radius r′ = 2r (scale factor k = 2).',
        'New SA = 4π(2r)² = 4 × (4πr²). Increase = 3 × original = 300%.',
      ],
    },
    kn: {
      question: 'ಗೋಳದ ತ್ರಿಜ್ಯವನ್ನು 100% ಹೆಚ್ಚಿಸಿದರೆ ಅದರ ಮೇಲ್ಮೈ ವಿಸ್ತೀರ್ಣ ಎಷ್ಟು ಶೇಕಡಾ ಹೆಚ್ಚಾಗುತ್ತದೆ?',
      shortcutTip: 'ತ್ರಿಜ್ಯ 2 ಪಟ್ಟು (k=2) ಆದರೆ ವಿಸ್ತೀರ್ಣ k² = 4 ಪಟ್ಟು ಆಗುತ್ತದೆ; ಹೆಚ್ಚಳ = 300%!',
      solutionSteps: ['ಹೊಸ ತ್ರಿಜ್ಯ r′ = 2r.', 'ಹೊಸ ವಿಸ್ತೀರ್ಣ 4 ಪಟ್ಟು ⇒ 300% ಹೆಚ್ಚಳ.'],
    },
    ta: {
      question: 'கோளத்தின் ஆரம் 100% அதிகரித்தால் அதன் மொத்தப் புறப்பரப்பு எத்தனை சதவீதம் அதிகரிக்கும்?',
      shortcutTip: 'ஆரம் 2 மடங்கு (k=2) எனில் பரப்பு k² = 4 மடங்கு; உயர்வு = 300%!',
      solutionSteps: ['புதிய ஆரம் r′ = 2r.', 'புதிய பரப்பு 4 மடங்கு ⇒ 300% உயர்வு.'],
    },
    te: {
      question: 'గోళం వ్యాసార్థాన్ని 100% పెంచితే ఉపరితల వైశాల్యం ఎంత శాతం పెరుగుతుంది?',
      shortcutTip: 'k = 2 అయితే వైశాల్యం k² = 4 రెట్లు అవుతుంది; పెరుగుదల = 300%!',
      solutionSteps: ['కొత్త వ్యాసార్థం = 2r.', 'కొత్త వైశాల్యం 4 రెట్లు ⇒ 300% పెరుగుదల.'],
    },
    hi: {
      question: 'यदि किसी गोले की त्रिज्या 100% बढ़ा दी जाए, तो उसका पृष्ठीय क्षेत्रफल कितने प्रतिशत बढ़ जाएगा?',
      shortcutTip: '100% वृद्धि अर्थात k = 2। क्षेत्रफल k² = 4 गुना होगा, अतः वृद्धि = (4 − 1) × 100% = 300%!',
      solutionSteps: ['नई त्रिज्या r′ = 2r।', 'नया क्षेत्रफल 4 गुना ⇒ 300% वृद्धि।'],
    },
  },
  {
    id: 'q_kcet_2',
    examTrack: 'kcet',
    difficulty: 'medium',
    topic: 'prism_pyramid',
    shape: SHAPES.TRIANGULAR_PRISM,
    questionType: 'mcq',
    syllabusTag: 'additional_practice',
    dimensions: { a: 4, h: 10 },
    formulaUsed: 'LSA_prism = Perimeter_base × h = 3a × h',
    options: ['40 cm²', '80 cm²', '120 cm²', '160 cm²'],
    correctIndex: 2,
    en: {
      question: 'Find the lateral surface area of an equilateral triangular prism of base edge 4 cm and height 10 cm.',
      shortcutTip: 'All prisms share LSA = (Base Perimeter) × Height = (3 × 4) × 10 = 120 cm² directly.',
      solutionSteps: [
        'Base perimeter of equilateral triangle = 3 × 4 = 12 cm.',
        'LSA = Perimeter × h = 12 × 10 = 120 cm².',
      ],
    },
    kn: {
      question: '4 ಸೆಂ.ಮೀ ಸಮಬಾಹು ತ್ರಿಕೋನ ಪಾದ ಮತ್ತು 10 ಸೆಂ.ಮೀ ಎತ್ತರವಿರುವ ಪ್ರಿಸಮ್‌ನ ಪಾರ್ಶ್ವ ವಿಸ್ತೀರ್ಣ ಎಷ್ಟು?',
      shortcutTip: 'ಪ್ರಿಸಮ್ LSA = ಸುತ್ತಳತೆ × ಎತ್ತರ = (3 × 4) × 10 = 120 ಸೆಂ.ಮೀ².',
      solutionSteps: ['ಪಾದದ ಸುತ್ತಳತೆ = 12 ಸೆಂ.ಮೀ.', 'LSA = 12 × 10 = 120 ಸೆಂ.ಮೀ².'],
    },
    ta: {
      question: 'அடிப்பக்க விளிம்பு 4 செ.மீ மற்றும் உயரம் 10 செ.மீ கொண்ட சமபக்க முக்கோணப் பட்டகத்தின் பக்கப்பரப்பு என்ன?',
      shortcutTip: 'LSA = சுற்றளவு × உயரம் = (3 × 4) × 10 = 120 செ.மீ².',
      solutionSteps: ['அடிச் சுற்றளவு = 12 செ.மீ.', 'LSA = 12 × 10 = 120 செ.மீ².'],
    },
    te: {
      question: 'భూమి భుజం 4 సెం.మీ మరియు ఎత్తు 10 సెం.మీ గల సమబాహు త్రిభుజ పట్టకం యొక్క పక్కతల వైశాల్యం ఎంత?',
      shortcutTip: 'LSA = చుట్టుకొలత × ఎత్తు = 12 × 10 = 120 సెం.మీ².',
      solutionSteps: ['చుట్టుకొలత = 12 సెం.మీ.', 'LSA = 12 × 10 = 120 సెం.మీ².'],
    },
    hi: {
      question: '4 सेमी समबाहु त्रिभुज आधार और 10 सेमी ऊँचाई वाले प्रिज्म का पार्श्व पृष्ठीय क्षेत्रफल ज्ञात करें।',
      shortcutTip: 'LSA = आधार परिमाप × ऊँचाई = (3 × 4) × 10 = 120 सेमी² सीधे हल!',
      solutionSteps: ['परिमाप = 12 सेमी।', 'LSA = 12 × 10 = 120 सेमी²।'],
    },
  },
  {
    id: 'q_kcet_3',
    examTrack: 'kcet',
    difficulty: 'medium',
    topic: 'cylinder',
    shape: SHAPES.CYLINDER,
    questionType: 'mcq',
    syllabusTag: 'ncert_core',
    dimensions: { r: 7, h: 10 },
    formulaUsed: '2πr = 44 ⇒ r = 7; V = πr²h',
    options: ['440 cm³', '770 cm³', '1540 cm³', '3080 cm³'],
    correctIndex: 2,
    en: {
      question: 'A rectangular sheet 44 cm × 10 cm is rolled along its length (44 cm) to form a cylinder of height 10 cm. Find its volume (use π = 22/7).',
      shortcutTip: 'Remember circumference 44 always means r = 7 and circle area πr² = 154! Multiply by h = 10 ⇒ 1540.',
      solutionSteps: [
        '2πr = 44 ⇒ r = 7 cm, h = 10 cm.',
        'V = (22/7) × 7 × 7 × 10 = 154 × 10 = 1540 cm³.',
      ],
    },
    kn: {
      question: '44 ಸೆಂ.ಮೀ × 10 ಸೆಂ.ಮೀ ಆಯತಾಕಾರದ ಹಾಳೆಯನ್ನು 44 ಸೆಂ.ಮೀ ಬದಿಯ ಉದ್ದಕ್ಕೂ ಸುತ್ತಿ 10 ಸೆಂ.ಮೀ ಎತ್ತರದ ಸಿಲಿಂಡರ್ ಮಾಡಿದರೆ ಘನಫಲ ಎಷ್ಟು?',
      shortcutTip: 'ಪರಿಧಿ 44 ⇒ r = 7 ಮತ್ತು ವಿಸ್ತೀರ್ಣ 154; × 10 = 1540!',
      solutionSteps: ['2πr = 44 ⇒ r = 7 ಸೆಂ.ಮೀ.', 'V = 154 × 10 = 1540 ಸೆಂ.ಮೀ³.'],
    },
    ta: {
      question: '44 செ.மீ × 10 செ.மீ செவ்வகத் தாளை 44 செ.மீ நீள வழியே சுருட்டி 10 செ.மீ உயர உருளை செய்தால் கன அளவு என்ன?',
      shortcutTip: 'சுற்றளவு 44 ⇒ r = 7, அடிப்பரப்பு 154; × 10 = 1540!',
      solutionSteps: ['2πr = 44 ⇒ r = 7 செ.மீ.', 'V = 154 × 10 = 1540 செ.மீ³.'],
    },
    te: {
      question: '44 సెం.మీ × 10 సెం.మీ కాగితాన్ని 44 సెం.మీ పొడవు వెంబడి చుట్టి 10 సెం.మీ ఎత్తు గల స్థూపం చేస్తే ఘనపరిమాణం ఎంత?',
      shortcutTip: 'చుట్టుకొలత 44 ⇒ r = 7, భూమి వైశాల్యం 154; × 10 = 1540!',
      solutionSteps: ['2πr = 44 ⇒ r = 7 సెం.మీ.', 'V = 154 × 10 = 1540 సెం.మీ³.'],
    },
    hi: {
      question: '44 सेमी × 10 सेमी आयताकार शीट को 44 सेमी लंबाई के अनुदिश मोड़कर 10 सेमी ऊँचा बेलन बनाने पर आयतन क्या होगा?',
      shortcutTip: 'परिधि 44 का अर्थ सदैव r = 7 व क्षेत्रफल 154 होता है! × 10 = 1540 सेमी³।',
      solutionSteps: ['2πr = 44 ⇒ r = 7 सेमी।', 'V = 154 × 10 = 1540 सेमी³।'],
    },
  },
  {
    id: 'q_kcet_4',
    examTrack: 'kcet',
    difficulty: 'advanced',
    topic: 'prism_pyramid',
    shape: SHAPES.SQUARE_PYRAMID,
    questionType: 'mcq',
    syllabusTag: 'additional_practice',
    dimensions: { a: 6, h: 4 },
    formulaUsed: 's = √(h² + (a/2)²), TSA = a² + 2as',
    options: ['60 cm²', '84 cm²', '96 cm²', '120 cm²'],
    correctIndex: 2,
    en: {
      question: 'A right square pyramid has base side 6 cm and vertical height 4 cm. Calculate its Total Surface Area.',
      shortcutTip: 'Half-base = 3, h = 4 ⇒ slant height s = 5 (3-4-5). TSA = 36 + 2(6)(5) = 96 cm².',
      solutionSteps: [
        'Slant height s = √(4² + (6/2)²) = √(16 + 9) = 5 cm.',
        'TSA = a² + 2as = 36 + 2(6)(5) = 96 cm².',
      ],
    },
    kn: {
      question: 'ಚೌಕ ಪಿರಮಿಡ್ ಪಾದದ ಬದಿ 6 ಸೆಂ.ಮೀ ಮತ್ತು ಎತ್ತರ 4 ಸೆಂ.ಮೀ ಆದರೆ ಪೂರ್ಣ ಮೇಲ್ಮೈ ವಿಸ್ತೀರ್ಣ (TSA) ಎಷ್ಟು?',
      shortcutTip: 'a/2 = 3, h = 4 ⇒ ಓರೆ ಎತ್ತರ s = 5; TSA = 36 + 60 = 96.',
      solutionSteps: ['s = √(4² + 3²) = 5 ಸೆಂ.ಮೀ.', 'TSA = 36 + 2(6)(5) = 96 ಸೆಂ.ಮೀ².'],
    },
    ta: {
      question: 'சதுர பிரமிடின் அடிப்பக்கம் 6 செ.மீ மற்றும் உயரம் 4 செ.மீ எனில் மொத்தப் புறப்பரப்பு (TSA) காண்க.',
      shortcutTip: 'a/2 = 3, h = 4 ⇒ சாயுயரம் s = 5; TSA = 36 + 60 = 96.',
      solutionSteps: ['s = √(4² + 3²) = 5 செ.மீ.', 'TSA = 36 + 2(6)(5) = 96 செ.மீ².'],
    },
    te: {
      question: 'చతురస్రాకార పిరమిడ్ భూమి భుజం 6 సెం.మీ మరియు ఎత్తు 4 సెం.మీ అయితే మొత్తం ఉపరితల వైశాల్యం (TSA) ఎంత?',
      shortcutTip: 'a/2 = 3, h = 4 ⇒ s = 5; TSA = 36 + 60 = 96.',
      solutionSteps: ['s = √(4² + 3²) = 5 సెం.మీ.', 'TSA = 36 + 2(6)(5) = 96 సెం.మీ².'],
    },
    hi: {
      question: 'एक सम वर्गाकार पिरामिड के आधार की भुजा 6 सेमी तथा ऊँचाई 4 सेमी है। इसका संपूर्ण पृष्ठीय क्षेत्रफल ज्ञात करें।',
      shortcutTip: 'a/2 = 3, h = 4 ⇒ तिर्यक ऊँचाई s = 5। TSA = 36 + 2(6)(5) = 96 सेमी²!',
      solutionSteps: ['तिर्यक ऊँचाई s = √(4² + 3²) = 5 सेमी।', 'TSA = 36 + 60 = 96 सेमी²।'],
    },
  },
  {
    id: 'q_kcet_5',
    examTrack: 'kcet',
    difficulty: 'advanced',
    topic: 'frustum_octahedron',
    shape: SHAPES.OCTAHEDRON,
    questionType: 'mcq',
    syllabusTag: 'additional_practice',
    dimensions: { a: 2 },
    formulaUsed: 'TSA_octahedron = 8 × (√3/4)a² = 2√3 a²',
    options: ['4√3 cm²', '6√3 cm²', '8√3 cm²', '12√3 cm²'],
    correctIndex: 2,
    en: {
      question: 'Find the total surface area of a regular octahedron whose every edge measures 2 cm.',
      shortcutTip: '8 equilateral faces combine cleanly into 2√3 × a² = 2√3 × 4 = 8√3 cm².',
      solutionSteps: [
        'Each of the 8 faces has area (√3 / 4)a² = √3 cm² for a = 2.',
        'Total TSA = 8 × √3 = 8√3 cm².',
      ],
    },
    kn: {
      question: 'ಪ್ರತಿ ಅಂಚು 2 ಸೆಂ.ಮೀ ಇರುವ ಸಮ ಅಷ್ಟಫಲಕದ (Octahedron) ಪೂರ್ಣ ಮೇಲ್ಮೈ ವಿಸ್ತೀರ್ಣ ಎಷ್ಟು?',
      shortcutTip: 'TSA = 2√3 × a² = 2√3 × 4 = 8√3 ಸೆಂ.ಮೀ².',
      solutionSteps: ['8 ಸಮಬಾಹು ತ್ರಿಕೋನ ಮುಖಗಳು.', 'TSA = 2√3 × 2² = 8√3 ಸೆಂ.ಮೀ².'],
    },
    ta: {
      question: 'ஒவ்வொரு விளிம்பும் 2 செ.மீ உள்ள ஒழுங்கு எண்முகனின் (Octahedron) மொத்தப் புறப்பரப்பு என்ன?',
      shortcutTip: 'TSA = 2√3 × a² = 2√3 × 4 = 8√3 செ.மீ².',
      solutionSteps: ['8 சமபக்க முக்கோணங்கள்.', 'TSA = 2√3 × 4 = 8√3 செ.மீ².'],
    },
    te: {
      question: 'ప్రతి అంచు 2 సెం.మీ ఉన్న క్రమ అష్టముఖి (Octahedron) యొక్క మొత్తం ఉపరితల వైశాల్యం ఎంత?',
      shortcutTip: 'TSA = 2√3 × a² = 2√3 × 4 = 8√3 సెం.మీ².',
      solutionSteps: ['8 సమబాహు త్రిభుజ ముఖాలు.', 'TSA = 2√3 × 4 = 8√3 సెం.మీ².'],
    },
    hi: {
      question: '2 सेमी किनारे वाले सम अष्टफलक (Regular Octahedron) का संपूर्ण पृष्ठीय क्षेत्रफल ज्ञात करें।',
      shortcutTip: '8 समबाहु त्रिभुजों का क्षेत्रफल = 2√3 × a² = 2√3 × 4 = 8√3 सेमी²।',
      solutionSteps: ['प्रत्येक फलक = (√3/4)(2²) = √3 सेमी²।', 'कुल क्षेत्रफल = 8 × √3 = 8√3 सेमी²।'],
    },
  },

  // ---------------- SSC TRACK ----------------
  {
    id: 'q_ssc_1',
    examTrack: 'ssc',
    difficulty: 'easy',
    topic: 'cube_cuboid',
    shape: SHAPES.CUBOID,
    questionType: 'mcq',
    syllabusTag: 'ncert_core',
    dimensions: { l: 9, b: 3, h: 3 },
    formulaUsed: 'Joined TSA = (4n + 2)a²',
    options: ['108 cm²', '126 cm²', '144 cm²', '162 cm²'],
    correctIndex: 1,
    en: {
      question: 'Three identical cubes each of side 3 cm are joined end to end in a row. Find the total surface area of the resulting cuboid.',
      shortcutTip: 'For n cubes in a line, visible square faces = 4n + 2! For n = 3 ⇒ 14 faces × 3² = 126 cm².',
      solutionSteps: [
        'Resulting cuboid has l = 9 cm, b = 3 cm, h = 3 cm.',
        'TSA = 2(27 + 9 + 27) = 126 cm².',
      ],
    },
    kn: {
      question: '3 ಸೆಂ.ಮೀ ಅಂಚಿನ 3 ಸಮಾನ ಘನಗಳನ್ನು ಸಾಲಾಗಿ ಜೋಡಿಸಿದರೆ ಬರುವ ಆಯತಘನದ ಪೂರ್ಣ ಮೇಲ್ಮೈ ವಿಸ್ತೀರ್ಣ ಎಷ್ಟು?',
      shortcutTip: 'n ಘನಗಳಿಗೆ ಕಾಣುವ ಮುಖಗಳು = 4n + 2 = 14; 14 × 3² = 126!',
      solutionSteps: ['l = 9, b = 3, h = 3.', 'TSA = 2(27 + 9 + 27) = 126 ಸೆಂ.ಮೀ².'],
    },
    ta: {
      question: '3 செ.மீ பக்க அளவுள்ள 3 ஒரே மாதிரியான கனசதுரங்களை வரிசையாக இணைத்தால் கிடைக்கும் கனசெவ்வகத்தின் TSA என்ன?',
      shortcutTip: 'தெரியும் முகங்கள் = 4n + 2 = 14; 14 × 9 = 126 செ.மீ²!',
      solutionSteps: ['l = 9, b = 3, h = 3.', 'TSA = 2(27 + 9 + 27) = 126 செ.மீ².'],
    },
    te: {
      question: '3 సెం.మీ అంచు గల 3 ఒకే రకమైన ఘనాలను వరుసగా కలిపితే ఏర్పడే దీర్ఘఘనం మొత్తం వైశాల్యం ఎంత?',
      shortcutTip: 'కనిపించే ముఖాలు = 4n + 2 = 14; 14 × 9 = 126 సెం.మీ²!',
      solutionSteps: ['l = 9, b = 3, h = 3.', 'TSA = 2(27 + 9 + 27) = 126 సెం.మీ².'],
    },
    hi: {
      question: '3 सेमी भुजा वाले तीन समान घनों को सिरे से सिरा मिलाकर जोड़ने पर बने घनाभ का संपूर्ण पृष्ठीय क्षेत्रफल क्या होगा?',
      shortcutTip: 'n जुड़े घनों में दिखने वाले वर्ग फलक = 4n + 2 = 14; अतः TSA = 14 × 9 = 126 सेमी²!',
      solutionSteps: ['नया घनाभ: l = 9, b = 3, h = 3 सेमी।', 'TSA = 2(27 + 9 + 27) = 126 सेमी²।'],
    },
  },
  {
    id: 'q_ssc_2',
    examTrack: 'ssc',
    difficulty: 'medium',
    topic: 'cube_cuboid',
    shape: SHAPES.CUBOID,
    questionType: 'mcq',
    syllabusTag: 'additional_practice',
    dimensions: { l: 4, b: 3, h: 6 },
    formulaUsed: 'V = √(A₁ × A₂ × A₃)',
    options: ['54 cm³', '72 cm³', '96 cm³', '144 cm³'],
    correctIndex: 1,
    en: {
      question: 'The areas of three mutually adjacent faces of a cuboid are 12 cm², 18 cm², and 24 cm². Find its volume.',
      shortcutTip: 'Multiply the 3 areas and take square root: V = √(12 × 18 × 24) = √((6×2)(6×3)(6×4)) = 6×6×2 = 72!',
      solutionSteps: [
        'lb = 12, bh = 18, hl = 24 ⇒ (lbh)² = 12 × 18 × 24 = 5184.',
        'V = lbh = √5184 = 72 cm³.',
      ],
    },
    kn: {
      question: 'ಆಯತಘನದ 3 ಪಕ್ಕದ ಮುಖಗಳ ವಿಸ್ತೀರ್ಣಗಳು 12, 18 ಮತ್ತು 24 ಸೆಂ.ಮೀ² ಆದರೆ ಅದರ ಘನಫಲ ಎಷ್ಟು?',
      shortcutTip: 'V = √(A₁ × A₂ × A₃) = √(12 × 18 × 24) = √5184 = 72 ಸೆಂ.ಮೀ³.',
      solutionSteps: ['(lbh)² = 12 × 18 × 24 = 5184.', 'V = √5184 = 72 ಸೆಂ.ಮೀ³.'],
    },
    ta: {
      question: 'ஒரு கனசெவ்வகத்தின் அடுத்தடுத்த 3 முகங்களின் பரப்பளவுகள் 12, 18, 24 செ.மீ² எனில் அதன் கன அளவு என்ன?',
      shortcutTip: 'V = √(12 × 18 × 24) = √5184 = 72 செ.மீ³.',
      solutionSteps: ['(lbh)² = 12 × 18 × 24 = 5184.', 'V = 72 செ.மீ³.'],
    },
    te: {
      question: 'ఒక దీర్ఘఘనం పక్కపక్కనే ఉన్న 3 ముఖాల వైశాల్యాలు 12, 18, 24 సెం.మీ² అయితే దాని ఘనపరిమాణం ఎంత?',
      shortcutTip: 'V = √(12 × 18 × 24) = √5184 = 72 సెం.మీ³.',
      solutionSteps: ['(lbh)² = 5184.', 'V = 72 సెం.మీ³.'],
    },
    hi: {
      question: 'एक घनाभ के तीन संलग्न फलकों के क्षेत्रफल 12, 18 तथा 24 सेमी² हैं। इसका आयतन ज्ञात करें।',
      shortcutTip: 'सीधा सूत्र V = √(A₁ × A₂ × A₃) = √(12 × 18 × 24) = 72 सेमी³!',
      solutionSteps: ['(lbh)² = 12 × 18 × 24 = 5184।', 'V = √5184 = 72 सेमी³।'],
    },
  },
  {
    id: 'q_ssc_3',
    examTrack: 'ssc',
    difficulty: 'medium',
    topic: 'cone',
    shape: SHAPES.CONE,
    questionType: 'mcq',
    syllabusTag: 'ncert_core',
    dimensions: { r: 7, h: 10 },
    formulaUsed: 'l = √(r² + h²), CSA = πrl',
    options: ['440 cm²', '528 cm²', '550 cm²', '704 cm²'],
    correctIndex: 2,
    en: {
      question: 'Find the curved surface area of a cone with radius 7 cm and vertical height 24 cm (π = 22/7).',
      shortcutTip: 'Spot 7-24-25 triple ⇒ l = 25. Since r = 7 cancels the denominator 7, CSA = 22 × 25 = 550.',
      solutionSteps: [
        'Slant height l = √(7² + 24²) = √625 = 25 cm.',
        'CSA = (22/7) × 7 × 25 = 22 × 25 = 550 cm².',
      ],
    },
    kn: {
      question: '7 ಸೆಂ.ಮೀ ತ್ರಿಜ್ಯ ಮತ್ತು 24 ಸೆಂ.ಮೀ ಎತ್ತರದ ಶಂಕುವಿನ ವಕ್ರ ವಿಸ್ತೀರ್ಣ (CSA) ಕಂಡುಹಿಡಿಯಿರಿ.',
      shortcutTip: '7-24-25 ತ್ರಿವಳಿಯಿಂದ l = 25. ನಂತರ CSA = 22 × 25 = 550!',
      solutionSteps: ['l = √(7² + 24²) = 25 ಸೆಂ.ಮೀ.', 'CSA = (22/7)×7×25 = 550 ಸೆಂ.ಮೀ².'],
    },
    ta: {
      question: 'ஆரம் 7 செ.மீ மற்றும் உயரம் 24 செ.மீ கொண்ட கூம்பின் வளைபரப்பு (CSA) காண்க.',
      shortcutTip: '7-24-25 மூன்றி ⇒ l = 25; CSA = 22 × 25 = 550 செ.மீ²!',
      solutionSteps: ['l = 25 செ.மீ.', 'CSA = (22/7) × 7 × 25 = 550 செ.மீ².'],
    },
    te: {
      question: '7 సెం.మీ వ్యాసార్థం మరియు 24 సెం.మీ ఎత్తు గల శంఖువు వక్ర ఉపరితల వైశాల్యం ఎంత?',
      shortcutTip: '7-24-25 త్రికం ⇒ l = 25; CSA = 22 × 25 = 550!',
      solutionSteps: ['l = 25 సెం.మీ.', 'CSA = (22/7) × 7 × 25 = 550 సెం.మీ².'],
    },
    hi: {
      question: '7 सेमी त्रिज्या और 24 सेमी ऊँचाई वाले शंकु का वक्र पृष्ठीय क्षेत्रफल (CSA) ज्ञात करें (π = 22/7)।',
      shortcutTip: '7-24-25 त्रिक से l = 25; 7 से 7 कटता है ⇒ CSA = 22 × 25 = 550 सेमी²!',
      solutionSteps: ['l = √(7² + 24²) = 25 सेमी।', 'CSA = (22/7) × 7 × 25 = 550 सेमी²।'],
    },
  },
  {
    id: 'q_ssc_4',
    examTrack: 'ssc',
    difficulty: 'advanced',
    topic: 'scaling_ratio',
    shape: SHAPES.CONE,
    questionType: 'mcq',
    syllabusTag: 'additional_practice',
    dimensions: { r: 2, h: 5 },
    formulaUsed: 'V₁ : V₂ = r₁²h₁ : r₂²h₂',
    options: ['2 : 3', '4 : 9', '8 : 27', '9 : 4'],
    correctIndex: 1,
    en: {
      question: 'Two right circular cones have equal heights, and their base radii are in the ratio 2 : 3. What is the ratio of their volumes?',
      shortcutTip: 'With equal h and same ⅓π constant, V₁ : V₂ simplifies straight to r₁² : r₂² = 2² : 3² = 4 : 9.',
      solutionSteps: [
        'V₁ / V₂ = (⅓π r₁² h) / (⅓π r₂² h) = (r₁ / r₂)².',
        '= (2 / 3)² = 4 : 9.',
      ],
    },
    kn: {
      question: 'ಸಮಾನ ಎತ್ತರದ ಎರಡು ಶಂಕುಗಳ ತ್ರಿಜ್ಯಗಳ ಅನುಪಾತ 2 : 3 ಆದರೆ ಅವುಗಳ ಘನಫಲಗಳ ಅನುಪಾತ ಎಷ್ಟು?',
      shortcutTip: 'ಎತ್ತರ ಸಮನಾಗಿರುವುದರಿಂದ V₁ : V₂ = r₁² : r₂² = 4 : 9.',
      solutionSteps: ['V ∝ r² (h ಸ್ಥಿರ).', '2² : 3² = 4 : 9.'],
    },
    ta: {
      question: 'சம உயரமுள்ள இரு கூம்புகளின் ஆரங்களின் விகிதம் 2 : 3 எனில் கன அளவுகளின் விகிதம் என்ன?',
      shortcutTip: 'உயரம் சமம் என்பதால் V₁ : V₂ = 2² : 3² = 4 : 9.',
      solutionSteps: ['V₁ : V₂ = r₁² : r₂².', '= 4 : 9.'],
    },
    te: {
      question: 'సమాన ఎత్తులు గల రెండు శంఖువుల వ్యాసార్థాల నిష్పత్తి 2 : 3 అయితే వాటి ఘనపరిమాణాల నిష్పత్తి ఎంత?',
      shortcutTip: 'h సమానం కాబట్టి V₁ : V₂ = 2² : 3² = 4 : 9.',
      solutionSteps: ['V ∝ r².', '2² : 3² = 4 : 9.'],
    },
    hi: {
      question: 'समान ऊँचाई वाले दो शंकुओं की त्रिज्याओं का अनुपात 2 : 3 है। उनके आयतनों का अनुपात क्या होगा?',
      shortcutTip: 'समान h होने से आयतन अनुपात सीधे r₁² : r₂² = 4 : 9 होता है!',
      solutionSteps: ['V₁/V₂ = (r₁/r₂)²।', '= 2² : 3² = 4 : 9।'],
    },
  },
  {
    id: 'q_ssc_5',
    examTrack: 'ssc',
    difficulty: 'easy',
    topic: 'sphere_hemisphere',
    shape: SHAPES.HEMISPHERE,
    questionType: 'mcq',
    syllabusTag: 'ncert_core',
    dimensions: { r: 7 },
    formulaUsed: 'TSA_hemisphere = 3πr²',
    options: ['308 cm²', '462 cm²', '616 cm²', '154 cm²'],
    correctIndex: 1,
    en: {
      question: 'Calculate the total surface area of a solid hemisphere of radius 7 cm (use π = 22/7).',
      shortcutTip: 'Use circle area 154 for r = 7: Solid Hemisphere TSA = 3πr² = 3 × 154 = 462 cm²!',
      solutionSteps: [
        'Solid hemisphere TSA = 2πr² (curved) + πr² (flat base) = 3πr².',
        'TSA = 3 × (22/7) × 7 × 7 = 3 × 154 = 462 cm².',
      ],
    },
    kn: {
      question: '7 ಸೆಂ.ಮೀ ತ್ರಿಜ್ಯವಿರುವ ಘನ ಅರ್ಧಗೋಳದ ಪೂರ್ಣ ಮೇಲ್ಮೈ ವಿಸ್ತೀರ್ಣ ಕಂಡುಹಿಡಿಯಿರಿ (π = 22/7).',
      shortcutTip: 'r = 7 ಗೆ ವೃತ್ತ = 154; ಅರ್ಧಗೋಳ TSA = 3 × 154 = 462 ಸೆಂ.ಮೀ².',
      solutionSteps: ['TSA = 3πr².', '3 × (22/7) × 49 = 462 ಸೆಂ.ಮೀ².'],
    },
    ta: {
      question: '7 செ.மீ ஆரமுள்ள திண்ம அரைக்கோளத்தின் மொத்தப் புறப்பரப்பைக் காண்க (π = 22/7).',
      shortcutTip: 'r = 7 எனில் πr² = 154; அரைக்கோள TSA = 3 × 154 = 462 செ.மீ².',
      solutionSteps: ['TSA = 3πr².', '3 × 154 = 462 செ.மீ².'],
    },
    te: {
      question: '7 సెం.మీ వ్యాసార్థం గల ఘన అర్ధగోళం యొక్క మొత్తం ఉపరితల వైశాల్యం ఎంత (π = 22/7)?',
      shortcutTip: 'r = 7 వద్ద πr² = 154; TSA = 3 × 154 = 462 సెం.మీ².',
      solutionSteps: ['TSA = 3πr².', '3 × 154 = 462 సెం.మీ².'],
    },
    hi: {
      question: '7 सेमी त्रिज्या वाले ठोस अर्धगोले का संपूर्ण पृष्ठीय क्षेत्रफल ज्ञात करें (π = 22/7)।',
      shortcutTip: 'r = 7 के लिए πr² = 154 याद रखें; TSA = 3 × 154 = 462 सेमी²!',
      solutionSteps: ['ठोस अर्धगोले का TSA = 3πr²।', '3 × 154 = 462 सेमी²।'],
    },
  },

  // ---------------- BANKING TRACK ----------------
  {
    id: 'q_bank_1',
    examTrack: 'banking',
    difficulty: 'easy',
    topic: 'cube_cuboid',
    shape: SHAPES.CUBOID,
    questionType: 'numerical',
    syllabusTag: 'additional_practice',
    dimensions: { l: 10, b: 8, h: 5 },
    formulaUsed: 'Cost = 2h(l + b) × Rate',
    options: ['₹2,400', '₹2,800', '₹3,000', '₹3,600'],
    correctIndex: 2,
    en: {
      question: 'A hall is 12 m long, 8 m wide, and 5 m high. Find the cost of whitewashing its four walls at ₹15 per m².',
      shortcutTip: 'Compute 2h = 10 first! Then 10 × (12 + 8) = 200 m², and 200 × 15 = ₹3,000 in 5 seconds.',
      solutionSteps: [
        'Area of 4 walls (LSA) = 2h(l + b) = 2 × 5 × (12 + 8) = 200 m².',
        'Total cost = 200 × ₹15 = ₹3,000.',
      ],
    },
    kn: {
      question: '12 ಮೀ ಉದ್ದ, 8 ಮೀ ಅಗಲ, 5 ಮೀ ಎತ್ತರದ ಸಭಾಂಗಣದ 4 ಗೋಡೆಗಳಿಗೆ ₹15/ಮೀ² ದರದಲ್ಲಿ ಬಣ್ಣ ಬಳಿಯುವ ವೆಚ್ಚ ಎಷ್ಟು?',
      shortcutTip: '2h = 10 ⇒ 10 × 20 = 200 ಮೀ²; 200 × 15 = ₹3,000.',
      solutionSteps: ['4 ಗೋಡೆಗಳ ವಿಸ್ತೀರ್ಣ = 2×5×(12+8) = 200 ಮೀ².', 'ವೆಚ್ಚ = 200 × 15 = ₹3,000.'],
    },
    ta: {
      question: '12 மீ நீளம், 8 மீ அகலம், 5 மீ உயரம் கொண்ட மண்டபத்தின் 4 சுவர்களுக்கு ச.மீ-க்கு ₹15 வீதம் வண்ணம் பூச ஆகும் செலவு என்ன?',
      shortcutTip: '2h = 10 ⇒ 10 × 20 = 200 மீ²; × 15 = ₹3,000.',
      solutionSteps: ['4 சுவர் பரப்பு = 2 × 5 × 20 = 200 மீ².', 'செலவு = ₹3,000.'],
    },
    te: {
      question: '12 మీ పొడవు, 8 మీ వెడల్పు, 5 మీ ఎత్తు గల హాలు 4 గోడలకు చ.మీ.కు ₹15 చొప్పున రంగు వేయడానికి అయ్యే ఖర్చు ఎంత?',
      shortcutTip: '2h = 10 ⇒ 10 × 20 = 200 మీ²; × 15 = ₹3,000.',
      solutionSteps: ['4 గోడలు = 200 మీ².', 'ఖర్చు = 200 × 15 = ₹3,000.'],
    },
    hi: {
      question: '12 मीटर लंबे, 8 मीटर चौड़े और 5 मीटर ऊँचे हॉल की चारों दीवारों पर ₹15 प्रति मी² की दर से पुताई का खर्च कितना होगा?',
      shortcutTip: 'पहले 2h = 10 निकालें! फिर 10 × 20 = 200 मी² और 200 × 15 = ₹3,000।',
      solutionSteps: ['4 दीवारें = 2×5×(12+8) = 200 मी²।', 'कुल खर्च = 200 × 15 = ₹3,000।'],
    },
  },
  {
    id: 'q_bank_2',
    examTrack: 'banking',
    difficulty: 'medium',
    topic: 'cylinder',
    shape: SHAPES.CYLINDER,
    questionType: 'numerical',
    syllabusTag: 'ncert_core',
    dimensions: { r: 7, h: 10 },
    formulaUsed: 'V = πr²h ⇒ h = V / (πr²)',
    options: ['5 m', '8 m', '10 m', '14 m'],
    correctIndex: 2,
    en: {
      question: 'A cylindrical reservoir of radius 7 m holds 1540 m³ of water. Find the depth (height) of the reservoir (π = 22/7).',
      shortcutTip: 'For r = 7, base area πr² = 154 automatically, so h = 1540 / 154 = 10 m!',
      solutionSteps: [
        'Base area = (22/7) × 7² = 154 m².',
        'Depth h = Volume / Base Area = 1540 / 154 = 10 m.',
      ],
    },
    kn: {
      question: '7 ಮೀ ತ್ರಿಜ್ಯದ ಸಿಲಿಂಡರ್ ಟ್ಯಾಂಕ್ 1540 ಮೀ³ ನೀರು ಹಿಡಿಯುತ್ತದೆ. ಅದರ ಆಳ (ಎತ್ತರ) ಎಷ್ಟು?',
      shortcutTip: 'r = 7 ಗೆ ಪಾದ = 154; h = 1540 / 154 = 10 ಮೀ!',
      solutionSteps: ['ಪಾದದ ವಿಸ್ತೀರ್ಣ = 154 ಮೀ².', 'ಎತ್ತರ = 1540 / 154 = 10 ಮೀ.'],
    },
    ta: {
      question: '7 மீ ஆரமுள்ள உருளை நீர்த்தொட்டி 1540 மீ³ நீர் கொள்ளுமானால் அதன் ஆழம் (உயரம்) என்ன?',
      shortcutTip: 'r = 7 ⇒ அடிப்பரப்பு = 154; உயரம் = 1540 / 154 = 10 மீ!',
      solutionSteps: ['அடிப்பரப்பு = 154 மீ².', 'h = 1540 / 154 = 10 மீ.'],
    },
    te: {
      question: '7 మీ వ్యాసార్థం గల స్థూప నీటి ట్యాంక్ 1540 మీ³ నీరు పడితే దాని లోతు (ఎత్తు) ఎంత?',
      shortcutTip: 'r = 7 ⇒ భూమి వైశాల్యం = 154; h = 1540 / 154 = 10 మీ!',
      solutionSteps: ['భూమి = 154 మీ².', 'h = 1540 / 154 = 10 మీ.'],
    },
    hi: {
      question: '7 मीटर त्रिज्या वाला एक बेलनाकार जलाशय 1540 मी³ पानी रखता है। इसकी गहराई ज्ञात कीजिए (π = 22/7)।',
      shortcutTip: 'r = 7 पर आधार क्षेत्रफल 154 होता है, अतः h = 1540 / 154 = 10 मी सीधा उत्तर!',
      solutionSteps: ['आधार क्षेत्रफल = 154 मी²।', 'ऊँचाई h = 1540 / 154 = 10 मी।'],
    },
  },
  {
    id: 'q_bank_3',
    examTrack: 'banking',
    difficulty: 'medium',
    topic: 'scaling_ratio',
    shape: SHAPES.CUBOID,
    questionType: 'mcq',
    syllabusTag: 'additional_practice',
    dimensions: { l: 6, b: 5, h: 4 },
    formulaUsed: 'Multiplier = (1 + p/100)(1 + q/100)(1 − d/100)',
    options: ['+10%', '+20%', '+25%', 'No change'],
    correctIndex: 1,
    en: {
      question: 'If the length and breadth of a cuboid increase by 20% and 25% respectively while height decreases by 20%, find the net percentage change in volume.',
      shortcutTip: 'Notice +20% (6/5) and −20% (4/5)? Multiply fractions: (6/5)×(5/4)×(4/5) = 6/5 = 1.20 ⇒ +20%!',
      solutionSteps: [
        'Factors: 1.20 × 1.25 × 0.80 = 1.20 × 1.00 = 1.20.',
        'Net change = (1.20 − 1) × 100% = +20% increase.',
      ],
    },
    kn: {
      question: 'ಆಯತಘನದ ಉದ್ದ 20% ಮತ್ತು ಅಗಲ 25% ಹೆಚ್ಚಾಗಿ ಎತ್ತರ 20% ಕಡಿಮೆಯಾದರೆ ಘನಫಲದಲ್ಲಿ ನಿವ್ವಳ ಬದಲಾವಣೆ ಎಷ್ಟು?',
      shortcutTip: '1.20 × (1.25 × 0.80) = 1.20 × 1 = 1.20 ⇒ +20%!',
      solutionSteps: ['1.25 × 0.80 = 1.', 'ಉಳಿದ ಅಂಶ = 1.20 ⇒ +20% ಹೆಚ್ಚಳ.'],
    },
    ta: {
      question: 'கனசெவ்வகத்தின் நீளம் 20%, அகலம் 25% அதிகரித்து உயரம் 20% குறைந்தால் கன அளவில் நிகர மாற்றம் என்ன?',
      shortcutTip: '1.25 × 0.80 = 1.00! எனவே 1.20 × 1 = 1.20 ⇒ +20% உயர்வு!',
      solutionSteps: ['பெருக்கல்: 1.2 × 1.25 × 0.8 = 1.2.', 'நிகர மாற்றம் = +20%.'],
    },
    te: {
      question: 'దీర్ఘఘనం పొడవు 20%, వెడల్పు 25% పెరిగి ఎత్తు 20% తగ్గితే ఘనపరిమాణంలో నికర మార్పు ఎంత?',
      shortcutTip: '1.25 × 0.80 = 1.00! కాబట్టి మిగిలేది 1.20 ⇒ +20% పెరుగుదల!',
      solutionSteps: ['1.2 × 1.25 × 0.8 = 1.2.', '+20% పెరుగుదల.'],
    },
    hi: {
      question: 'यदि किसी घनाभ की लंबाई 20% और चौड़ाई 25% बढ़े तथा ऊँचाई 20% घटे, तो आयतन में शुद्ध प्रतिशत परिवर्तन क्या होगा?',
      shortcutTip: '1.25 × 0.80 = 1.00 होता है! इसलिए 1.20 × 1 = 1.20 ⇒ +20% वृद्धि!',
      solutionSteps: ['गुणक = 1.20 × 1.25 × 0.80 = 1.20।', 'शुद्ध वृद्धि = +20%।'],
    },
  },
  {
    id: 'q_bank_4',
    examTrack: 'banking',
    difficulty: 'advanced',
    topic: 'combinations_conversion',
    shape: SHAPES.CUBE,
    questionType: 'numerical',
    syllabusTag: 'additional_practice',
    dimensions: { a: 5 },
    formulaUsed: 'Coins = V_cuboid / (πr²t)',
    options: ['350', '500', '700', '880'],
    correctIndex: 2,
    en: {
      question: 'A metallic cuboid of dimensions 11 cm × 10 cm × 7 cm is melted into cylindrical coins of radius 1 cm and thickness 0.35 cm. How many coins are produced (π = 22/7)?',
      shortcutTip: 'Check coin volume: (22/7) × 1 × 0.35 = 1.1 cm³! Since 11/1.1 = 10, N = 10 × 10 × 7 = 700.',
      solutionSteps: [
        'V_cuboid = 11 × 10 × 7 = 770 cm³.',
        'V_coin = (22/7) × 1² × 0.35 = 1.1 cm³ ⇒ Coins = 770 / 1.1 = 700.',
      ],
    },
    kn: {
      question: '11×10×7 ಸೆಂ.ಮೀ ಆಯತಘನವನ್ನು ಕರಗಿಸಿ 1 ಸೆಂ.ಮೀ ತ್ರಿಜ್ಯ ಮತ್ತು 0.35 ಸೆಂ.ಮೀ ದಪ್ಪದ ಎಷ್ಟು ನಾಣ್ಯಗಳನ್ನು ತಯಾರಿಸಬಹುದು?',
      shortcutTip: 'ಒಂದು ನಾಣ್ಯದ ಘನಫಲ = (22/7)×0.35 = 1.1. ಆದ್ದರಿಂದ 770 / 1.1 = 700.',
      solutionSteps: ['ಘನಫಲ = 770 ಸೆಂ.ಮೀ³.', '770 / 1.1 = 700 ನಾಣ್ಯಗಳು.'],
    },
    ta: {
      question: '11 × 10 × 7 செ.மீ கனசெவ்வகத்தை உருக்கி 1 செ.மீ ஆரம், 0.35 செ.மீ தடிமன் கொண்ட எத்தனை நாணயங்கள் செய்யலாம்?',
      shortcutTip: 'ஒரு நாணயம் = (22/7) × 0.35 = 1.1; 770 / 1.1 = 700!',
      solutionSteps: ['V_கனசெவ்வகம் = 770 செ.மீ³.', '770 / 1.1 = 700 நாணயங்கள்.'],
    },
    te: {
      question: '11×10×7 సెం.మీ దీర్ఘఘనాన్ని కరిగించి 1 సెం.మీ వ్యాసార్థం, 0.35 సెం.మీ మందం గల ఎన్ని నాణేలు చేయవచ్చు?',
      shortcutTip: 'ఒక నాణెం = (22/7)×0.35 = 1.1; 770 / 1.1 = 700!',
      solutionSteps: ['V_cuboid = 770.', '770 / 1.1 = 700 నాణేలు.'],
    },
    hi: {
      question: '11 × 10 × 7 सेमी घनाभ को पिघलाकर 1 सेमी त्रिज्या और 0.35 सेमी मोटाई के कितने बेलनाकार सिक्के बनेंगे?',
      shortcutTip: '1 सिक्का = (22/7) × 0.35 = 1.1 सेमी³; अतः 770 / 1.1 = 700 सिक्के!',
      solutionSteps: ['घनाभ आयतन = 770 सेमी³।', 'सिक्के = 770 / 1.1 = 700।'],
    },
  },
  {
    id: 'q_bank_5',
    examTrack: 'banking',
    difficulty: 'easy',
    topic: 'cylinder',
    shape: SHAPES.CYLINDER,
    questionType: 'numerical',
    syllabusTag: 'ncert_core',
    dimensions: { r: 2, h: 5 },
    formulaUsed: 'Area = N × 2πrh = N × πdh',
    options: ['22 m²', '44 m²', '66 m²', '88 m²'],
    correctIndex: 1,
    en: {
      question: 'A cylindrical road roller has diameter 0.7 m and length 2 m. How much area does it level in 10 complete revolutions (π = 22/7)?',
      shortcutTip: 'Use πdh directly! π × 0.7 = 2.2 m circumference, × 2 m width = 4.4 m² per turn ⇒ 44 m² in 10 turns.',
      solutionSteps: [
        '1 revolution covers CSA = πdh = (22/7) × 0.7 × 2 = 4.4 m².',
        '10 revolutions = 10 × 4.4 = 44 m².',
      ],
    },
    kn: {
      question: '0.7 ಮೀ ವ್ಯಾಸ ಮತ್ತು 2 ಮೀ ಉದ್ದದ ರೋಡ್ ರೋಲರ್ 10 ಸುತ್ತುಗಳಲ್ಲಿ ಎಷ್ಟು ವಿಸ್ತೀರ್ಣ ಸಮತಟ್ಟು ಮಾಡುತ್ತದೆ?',
      shortcutTip: '1 ಸುತ್ತು = πdh = 2.2 × 2 = 4.4 ಮೀ²; 10 ಸುತ್ತು = 44 ಮೀ².',
      solutionSteps: ['CSA = (22/7)×0.7×2 = 4.4 ಮೀ².', '10 × 4.4 = 44 ಮೀ².'],
    },
    ta: {
      question: '0.7 மீ விட்டம், 2 மீ நீளம் கொண்ட சாலை உருளை 10 சுற்றுகளில் சமப்படுத்தும் பரப்பளவு என்ன?',
      shortcutTip: '1 சுற்று = πdh = 2.2 × 2 = 4.4 மீ²; 10 சுற்று = 44 மீ².',
      solutionSteps: ['1 சுற்று = 4.4 மீ².', '10 × 4.4 = 44 மீ².'],
    },
    te: {
      question: '0.7 మీ వ్యాసం, 2 మీ పొడవు గల రోడ్ రోలర్ 10 చుట్లలో ఎంత వైశాల్యం చదును చేస్తుంది?',
      shortcutTip: '1 చుట్టు = πdh = 4.4 మీ²; 10 చుట్లు = 44 మీ².',
      solutionSteps: ['CSA = 4.4 మీ².', '10 × 4.4 = 44 మీ².'],
    },
    hi: {
      question: '0.7 मी व्यास और 2 मी लंबाई वाला रोड रोलर 10 चक्करों में कितना क्षेत्र समतल करेगा (π = 22/7)?',
      shortcutTip: 'सीधा πdh: (22/7) × 0.7 × 2 = 4.4 मी² प्रति चक्कर ⇒ 10 चक्कर में 44 मी²!',
      solutionSteps: ['1 चक्कर = 4.4 मी²।', '10 चक्कर = 44 मी²।'],
    },
  },

  // ---------------- GENERAL QUANTITATIVE APTITUDE ----------------
  {
    id: 'q_apt_1',
    examTrack: 'general_aptitude',
    difficulty: 'easy',
    topic: 'cube_cuboid',
    shape: SHAPES.CUBE,
    questionType: 'mcq',
    syllabusTag: 'ncert_core',
    dimensions: { a: 7 },
    formulaUsed: 'a = ∛V, LSA = 4a²',
    options: ['147 cm²', '196 cm²', '294 cm²', '343 cm²'],
    correctIndex: 1,
    en: {
      question: 'The volume of a cube is 343 cm³. Find its Lateral Surface Area (4 walls).',
      shortcutTip: 'Recognise 343 = 7³ instantly, then multiply 4 × 49 = 196 cm² (don’t pick TSA 294!).',
      solutionSteps: [
        'Volume a³ = 343 ⇒ edge a = 7 cm.',
        'LSA = 4a² = 4 × 7² = 4 × 49 = 196 cm².',
      ],
    },
    kn: {
      question: 'ಒಂದು ಘನದ ಘನಫಲ 343 ಸೆಂ.ಮೀ³ ಆದರೆ, ಅದರ ಪಾರ್ಶ್ವ ಮೇಲ್ಮೈ ವಿಸ್ತೀರ್ಣ (LSA) ಎಷ್ಟು?',
      shortcutTip: 'a³ = 343 ⇒ a = 7; LSA = 4 × 49 = 196 ಸೆಂ.ಮೀ².',
      solutionSteps: ['a = ∛343 = 7 ಸೆಂ.ಮೀ.', 'LSA = 4 × 49 = 196 ಸೆಂ.ಮೀ².'],
    },
    ta: {
      question: 'கனசதுரத்தின் கன அளவு 343 செ.மீ³ எனில் அதன் பக்கப்பரப்பு (LSA) காண்க.',
      shortcutTip: 'a³ = 343 ⇒ a = 7; LSA = 4 × 49 = 196 செ.மீ².',
      solutionSteps: ['a = 7 செ.மீ.', 'LSA = 4 × 49 = 196 செ.மீ².'],
    },
    te: {
      question: 'ఒక ఘనం ఘనపరిమాణం 343 సెం.మీ³ అయితే దాని పక్కతల వైశాల్యం (LSA) ఎంత?',
      shortcutTip: 'a = 7; LSA = 4 × 49 = 196 సెం.మీ².',
      solutionSteps: ['a = 7 సెం.మీ.', 'LSA = 196 సెం.మీ².'],
    },
    hi: {
      question: 'एक घन का आयतन 343 सेमी³ है। इसका पार्श्व पृष्ठीय क्षेत्रफल (LSA) ज्ञात करें।',
      shortcutTip: '343 = 7³ से a = 7; फिर LSA = 4 × 49 = 196 सेमी² (TSA 294 न चुनें!)।',
      solutionSteps: ['a = ∛343 = 7 सेमी।', 'LSA = 4 × 49 = 196 सेमी²।'],
    },
  },
  {
    id: 'q_apt_2',
    examTrack: 'general_aptitude',
    difficulty: 'medium',
    topic: 'scaling_ratio',
    shape: SHAPES.CUBE,
    questionType: 'mcq',
    syllabusTag: 'additional_practice',
    dimensions: { a: 4 },
    formulaUsed: 'Unpainted inner cubes = (n − 2)³',
    options: ['4', '8', '16', '24'],
    correctIndex: 1,
    en: {
      question: 'A 4 cm cube is painted on all 6 faces and sliced into 64 identical 1 cm³ cubes. How many small cubes have ZERO painted faces?',
      shortcutTip: 'Strip off the 1 cm outer layer from each side: inner unpainted block = (4 − 2)³ = 2³ = 8.',
      solutionSteps: [
        'n = 4 / 1 = 4 divisions per edge.',
        'Inner unpainted cubes = (n − 2)³ = (4 − 2)³ = 2³ = 8.',
      ],
    },
    kn: {
      question: '4 ಸೆಂ.ಮೀ ಬಣ್ಣ ಬಳಿದ ಘನವನ್ನು 64 ಸಣ್ಣ 1 ಸೆಂ.ಮೀ ಘನಗಳಾಗಿ ಕತ್ತರಿಸಿದರೆ, ಬಣ್ಣವೇ ಇಲ್ಲದ ಘನಗಳು ಎಷ್ಟು?',
      shortcutTip: 'ಸೂತ್ರ: (n − 2)³ = (4 − 2)³ = 8.',
      solutionSteps: ['n = 4.', '(4 − 2)³ = 8 ಬಣ್ಣರಹಿತ ಘನಗಳು.'],
    },
    ta: {
      question: 'வண்ணம் பூசிய 4 செ.மீ கனசதுரத்தை 64 சிறிய 1 செ.மீ கனசதுரங்களாக வெட்டினால் வண்ணம் படாதவை எத்தனை?',
      shortcutTip: 'சூத்திரம்: (n − 2)³ = (4 − 2)³ = 8.',
      solutionSteps: ['n = 4.', '(4 − 2)³ = 8 கனசதுரங்கள்.'],
    },
    te: {
      question: 'రంగు వేసిన 4 సెం.మీ ఘనాన్ని 64 చిన్న 1 సెం.మీ ఘనాలుగా కోస్తే రంగు లేని ఘనాలు ఎన్ని?',
      shortcutTip: '(n − 2)³ = (4 − 2)³ = 8.',
      solutionSteps: ['n = 4.', '(4 − 2)³ = 8.'],
    },
    hi: {
      question: 'सभी 6 फलकों पर रंगे 4 सेमी घन को 64 छोटे 1 सेमी घनों में काटा जाता है। बिना रंग वाले कितने छोटे घन मिलेंगे?',
      shortcutTip: 'सीधा सूत्र: बिना रंगे आंतरिक घन = (n − 2)³ = (4 − 2)³ = 8!',
      solutionSteps: ['n = 4 भाग।', '(4 − 2)³ = 2³ = 8 घन।'],
    },
  },
  {
    id: 'q_apt_3',
    examTrack: 'general_aptitude',
    difficulty: 'medium',
    topic: 'sphere_hemisphere',
    shape: SHAPES.SPHERE,
    questionType: 'mcq',
    syllabusTag: 'ncert_core',
    dimensions: { r: 3 },
    formulaUsed: '4πr² : (3πr² + 3πr²)',
    options: ['1 : 2', '2 : 3', '3 : 4', '4 : 3'],
    correctIndex: 1,
    en: {
      question: 'A solid sphere is cut cleanly through its centre into two solid hemispheres. Find the ratio of the sphere’s surface area to the combined TSA of the two hemispheres.',
      shortcutTip: 'Original 4πr² vs two halves (3πr² each = 6πr²). Ratio 4 : 6 = 2 : 3.',
      solutionSteps: [
        'Sphere SA = 4πr²; two hemispheres add 2 flat circles ⇒ 6πr².',
        'Ratio = 4πr² : 6πr² = 2 : 3.',
      ],
    },
    kn: {
      question: 'ಒಂದು ಗೋಳವನ್ನು ಎರಡು ಘನ ಅರ್ಧಗೋಳಗಳಾಗಿ ಕತ್ತರಿಸಿದಾಗ ಗೋಳ ಮತ್ತು ಎರಡು ಅರ್ಧಗೋಳಗಳ ಪೂರ್ಣ ವಿಸ್ತೀರ್ಣಗಳ ಅನುಪಾತ ಎಷ್ಟು?',
      shortcutTip: '4πr² : 6πr² = 2 : 3.',
      solutionSteps: ['4πr² vs 3πr² + 3πr² = 6πr².', 'ಅನುಪಾತ = 2 : 3.'],
    },
    ta: {
      question: 'ஒரு திண்மக் கோளத்தை இரு அரைக்கோளங்களாக வெட்டினால் கோளம் : இரு அரைக்கோளங்களின் மொத்தப் பரப்பு விகிதம் என்ன?',
      shortcutTip: '4πr² : 6πr² = 2 : 3.',
      solutionSteps: ['4πr² vs 6πr².', 'விகிதம் = 2 : 3.'],
    },
    te: {
      question: 'ఒక ఘన గోళాన్ని రెండు అర్ధగోళాలుగా కోస్తే గోళం : రెండు అర్ధగోళాల మొత్తం వైశాల్యాల నిష్పత్తి ఎంత?',
      shortcutTip: '4πr² : 6πr² = 2 : 3.',
      solutionSteps: ['4πr² vs 6πr².', 'నిష్పత్తి = 2 : 3.'],
    },
    hi: {
      question: 'एक ठोस गोले को दो अर्धगोलों में काटने पर गोले के पृष्ठीय क्षेत्रफल और दोनों अर्धगोलों के कुल पृष्ठीय क्षेत्रफल का अनुपात क्या होगा?',
      shortcutTip: '4πr² : (3πr² + 3πr²) = 4 : 6 = 2 : 3।',
      solutionSteps: ['गोला = 4πr², 2 अर्धगोले = 6πr²।', 'अनुपात = 2 : 3।'],
    },
  },
  {
    id: 'q_apt_4',
    examTrack: 'general_aptitude',
    difficulty: 'advanced',
    topic: 'combinations_conversion',
    shape: SHAPES.HEMISPHERE,
    questionType: 'mcq',
    syllabusTag: 'additional_practice',
    dimensions: { r: 3 },
    formulaUsed: 'V_rem = πr²h − (2/3)πr³',
    options: ['54π cm³', '72π cm³', '81π cm³', '108π cm³'],
    correctIndex: 1,
    en: {
      question: 'From a solid cylinder of radius 3 cm and height 10 cm, a hemispherical depression of radius 3 cm is scooped out from the top. Find the remaining volume in terms of π.',
      shortcutTip: 'Keep π factored: πr²(h − ⅔r) = 9π(10 − 2) = 72π cm³ instantly!',
      solutionSteps: [
        'V_cylinder = π(3²)(10) = 90π; V_hemisphere = (2/3)π(3³) = 18π.',
        'Remaining Volume = 90π − 18π = 72π cm³.',
      ],
    },
    kn: {
      question: '3 ಸೆಂ.ಮೀ ತ್ರಿಜ್ಯ, 10 ಸೆಂ.ಮೀ ಎತ್ತರದ ಸಿಲಿಂಡರ್ ಮೇಲ್ಭಾಗದಿಂದ 3 ಸೆಂ.ಮೀ ತ್ರಿಜ್ಯದ ಅರ್ಧಗೋಳವನ್ನು ಕೊರೆದು ತೆಗೆದರೆ ಉಳಿಯುವ ಘನಫಲ (π ರೂಪದಲ್ಲಿ)?',
      shortcutTip: 'πr²(h − ⅔r) = 9π(10 − 2) = 72π ಸೆಂ.ಮೀ³!',
      solutionSteps: ['90π − 18π = 72π ಸೆಂ.ಮೀ³.'],
    },
    ta: {
      question: '3 செ.மீ ஆரம், 10 செ.மீ உயர உருளையிலிருந்து 3 செ.மீ ஆரமுள்ள அரைக்கோளம் குடையப்பட்டால் மீதமுள்ள கன அளவு என்ன?',
      shortcutTip: '9π(10 − 2) = 72π செ.மீ³!',
      solutionSteps: ['90π − 18π = 72π செ.மீ³.'],
    },
    te: {
      question: '3 సెం.మీ వ్యాసార్థం, 10 సెం.మీ ఎత్తు గల స్థూపం నుండి 3 సెం.మీ అర్ధగోళాన్ని తొలగిస్తే మిగిలిన ఘనపరిమాణం ఎంత?',
      shortcutTip: '9π(10 − 2) = 72π సెం.మీ³!',
      solutionSteps: ['90π − 18π = 72π సెం.మీ³.'],
    },
    hi: {
      question: '3 सेमी त्रिज्या और 10 सेमी ऊँचाई के ठोस बेलन से ऊपर से 3 सेमी त्रिज्या का अर्धगोला खोदकर निकालने पर शेष आयतन (π में) ज्ञात करें।',
      shortcutTip: 'πr²(h − ⅔r) = 9π(10 − 2) = 72π सेमी³ सीधे हल!',
      solutionSteps: ['90π − 18π = 72π सेमी³।'],
    },
  },
  {
    id: 'q_apt_5',
    examTrack: 'general_aptitude',
    difficulty: 'easy',
    topic: 'cone',
    shape: SHAPES.CONE,
    questionType: 'numerical',
    syllabusTag: 'ncert_core',
    dimensions: { r: 4, h: 5 },
    formulaUsed: 'V = ⅓ B h ⇒ h = 3V / B',
    options: ['3 cm', '4 cm', '5 cm', '6 cm'],
    correctIndex: 2,
    en: {
      question: 'The volume of a right circular cone is 85 cm³ and its base area is 51 cm². Find its vertical height.',
      shortcutTip: 'Divide Base Area by 3 first: 51 / 3 = 17! Then h = 85 / 17 = 5 cm.',
      solutionSteps: [
        'Volume = ⅓ × Base Area × h ⇒ 85 = ⅓ × 51 × h = 17h.',
        'h = 85 / 17 = 5 cm.',
      ],
    },
    kn: {
      question: 'ಶಂಕುವಿನ ಘನಫಲ 85 ಸೆಂ.ಮೀ³ ಮತ್ತು ಪಾದದ ವಿಸ್ತೀರ್ಣ 51 ಸೆಂ.ಮೀ² ಆದರೆ ಎತ್ತರ ಎಷ್ಟು?',
      shortcutTip: '51 / 3 = 17; ಹೀಗಾಗಿ h = 85 / 17 = 5 ಸೆಂ.ಮೀ!',
      solutionSteps: ['85 = ⅓ × 51 × h = 17h.', 'h = 5 ಸೆಂ.ಮೀ.'],
    },
    ta: {
      question: 'கூம்பின் கன அளவு 85 செ.மீ³ மற்றும் அடிப்பரப்பு 51 செ.மீ² எனில் அதன் உயரம் என்ன?',
      shortcutTip: '51 / 3 = 17; எனவே h = 85 / 17 = 5 செ.மீ!',
      solutionSteps: ['85 = 17h.', 'h = 5 செ.மீ.'],
    },
    te: {
      question: 'శంఖువు ఘనపరిమాణం 85 సెం.మీ³ మరియు భూమి వైశాల్యం 51 సెం.మీ² అయితే ఎత్తు ఎంత?',
      shortcutTip: '51 / 3 = 17; h = 85 / 17 = 5 సెం.మీ!',
      solutionSteps: ['85 = 17h.', 'h = 5 సెం.మీ.'],
    },
    hi: {
      question: 'एक शंकु का आयतन 85 सेमी³ तथा आधार क्षेत्रफल 51 सेमी² है। इसकी ऊँचाई ज्ञात करें।',
      shortcutTip: '51 / 3 = 17 निकालें, फिर h = 85 / 17 = 5 सेमी!',
      solutionSteps: ['85 = ⅓ × 51 × h = 17h।', 'h = 5 सेमी।'],
    },
  },
])

export const QUESTION_BANK = QUESTION_TEMPLATES

/**
 * Generates a non-duplicate filtered set of questions for Exam Mock Tests or Teacher Worksheets.
 */
export function generateQuestionSet({
  examTrack = 'all',
  topic = 'all',
  shape = 'all',
  difficulty = 'all',
  questionType = 'all',
  syllabusTag = 'all',
  count = 6,
  seed = 1,
} = {}) {
  const safeCount = Math.max(1, Math.min(QUESTION_BANK.length, Number(count) || 6))

  const filtered = QUESTION_BANK.filter((q) => {
    if (examTrack !== 'all' && q.examTrack !== examTrack) return false
    if (topic !== 'all' && q.topic !== topic) return false
    if (shape !== 'all' && q.shape !== shape) return false
    if (difficulty !== 'all' && q.difficulty !== difficulty) return false
    if (questionType !== 'all' && q.questionType !== questionType) return false
    if (syllabusTag !== 'all' && q.syllabusTag !== syllabusTag) return false
    return true
  })

  // Deterministic rotation/ordering by seed without Math.random inside render
  const ordered = [...filtered]
  const n = ordered.length
  if (n > 1) {
    for (let i = n - 1; i > 0; i -= 1) {
      const j = (i * 7 + (Number(seed) || 1) * 13) % (i + 1)
      const tmp = ordered[i]
      ordered[i] = ordered[j]
      ordered[j] = tmp
    }
  }

  const seenIds = new Set()
  const result = []
  for (const q of ordered) {
    if (!seenIds.has(q.id)) {
      seenIds.add(q.id)
      result.push(q)
      if (result.length >= safeCount) break
    }
  }

  return {
    questions: result,
    totalMatching: filtered.length,
  }
}

/**
 * Computes score, accuracy %, total time, and per-topic breakdown from a completed mock session.
 */
export function evaluateMockSession(questions, selectedAnswersById, timingsById = {}) {
  const safeQuestions = Array.isArray(questions) ? questions : []
  let correctCount = 0
  let answeredCount = 0
  let totalTimeSec = 0

  const perQuestion = safeQuestions.map((q) => {
    const picked = selectedAnswersById?.[q.id]
    const hasAnswered = Number.isInteger(picked) && picked >= 0 && picked < q.options.length
    const isCorrect = hasAnswered && picked === q.correctIndex
    const elapsed = Number.isFinite(timingsById?.[q.id]) ? timingsById[q.id] : 0
    if (hasAnswered) answeredCount += 1
    if (isCorrect) correctCount += 1
    totalTimeSec += elapsed
    return {
      id: q.id,
      topic: q.topic,
      examTrack: q.examTrack,
      difficulty: q.difficulty,
      correct: isCorrect,
      hasAnswered,
      pickedIndex: hasAnswered ? picked : null,
      correctIndex: q.correctIndex,
      timeSpentSec: elapsed,
    }
  })

  const totalQuestions = safeQuestions.length
  const accuracy =
    totalQuestions > 0 ? Math.round((correctCount / totalQuestions) * 100) : 0
  const avgTimeSec =
    totalQuestions > 0 ? Number((totalTimeSec / totalQuestions).toFixed(1)) : 0

  return {
    totalQuestions,
    answeredCount,
    correctCount,
    accuracy,
    totalTimeSec,
    avgTimeSec,
    perQuestion,
  }
}
