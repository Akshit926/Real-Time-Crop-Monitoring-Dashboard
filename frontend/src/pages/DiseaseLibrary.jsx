import { useState, useMemo } from 'react';
import { useLanguage } from '../context/LanguageContext';
import {
  BookMarked, Search, X, ChevronDown, ChevronUp,
  AlertTriangle, Shield, Droplets, Wind, Thermometer,
  Leaf, FlaskConical, Eye, Bug, Zap
} from 'lucide-react';
import './DiseaseLibrary.css';

/* ─── Disease Database ──────────────────────────────────────────── */
const DISEASES = [
  {
    id: 1,
    name: 'Late Blight',
    pathogen: 'Phytophthora infestans',
    type: 'Fungal',
    severity: 'critical',
    crops: ['Tomato', 'Potato'],
    emoji: '🍅',
    icon: Bug,
    description: 'A devastating water mold disease that can destroy an entire crop within days. Thrives in cool, wet conditions and spreads rapidly through rain splash.',
    symptoms: [
      'Dark brown water-soaked lesions on leaves',
      'White fuzzy mold on leaf undersides',
      'Rapid browning and death of foliage',
      'Brown rot of fruits and tubers',
    ],
    causes: ['High humidity (>90%)', 'Temperatures 10-25°C', 'Extended leaf wetness', 'Poor air circulation'],
    treatment: [
      'Apply copper-based or mancozeb fungicides immediately',
      'Remove and destroy infected plant material',
      'Improve air circulation and spacing',
      'Avoid overhead irrigation',
    ],
    prevention: ['Use resistant varieties', 'Crop rotation (3-4 years)', 'Avoid dense planting', 'Apply preventive fungicide sprays'],
    spreadRate: 'Very High',
    color: '#ef4444',
  },
  {
    id: 2,
    name: 'Early Blight',
    pathogen: 'Alternaria solani',
    type: 'Fungal',
    severity: 'warning',
    crops: ['Tomato', 'Potato'],
    emoji: '🥔',
    icon: Leaf,
    description: 'A common fungal disease causing distinctive target-like spots on leaves and stems. Primarily affects older leaves first before spreading upward.',
    symptoms: [
      'Circular dark spots with concentric rings (target pattern)',
      'Yellow halos surrounding the lesions',
      'Lower/older leaves affected first',
      'Premature leaf drop',
    ],
    causes: ['Warm temperatures 24-29°C', 'Alternating wet/dry cycles', 'Plant stress (drought, nutrient deficiency)', 'Dense canopy'],
    treatment: [
      'Apply chlorothalonil or azoxystrobin fungicide',
      'Remove infected lower leaves',
      'Maintain optimal plant nutrition',
      'Stake plants to improve airflow',
    ],
    prevention: ['Mulch soil to reduce splash', 'Balanced fertilization', 'Water at base of plant', 'Destroy crop debris'],
    spreadRate: 'Moderate',
    color: '#f97316',
  },
  {
    id: 3,
    name: 'Northern Leaf Blight',
    pathogen: 'Exserohilum turcicum',
    type: 'Fungal',
    severity: 'critical',
    crops: ['Corn'],
    emoji: '🌽',
    icon: Wind,
    description: 'One of the most damaging foliar diseases of corn, capable of causing 50-70% yield loss in severe cases. Long, cigar-shaped lesions are its hallmark.',
    symptoms: [
      'Long tan/gray elliptical lesions on leaves',
      'Lesions 3-15 cm long with irregular edges',
      'Greenish-gray spore masses on lesions',
      'Premature death of leaves in epidemics',
    ],
    causes: ['Cool temperatures 18-25°C', 'High humidity', 'Prolonged leaf wetness', 'Susceptible hybrids'],
    treatment: [
      'Foliar fungicide (strobilurin + triazole) at VT stage',
      'Scout fields regularly post-silking',
      'Apply fungicide before disease reaches upper leaves',
    ],
    prevention: ['Plant resistant hybrids', 'Crop rotation', 'Till residue to accelerate decomposition', 'Optimize plant density'],
    spreadRate: 'High',
    color: '#ef4444',
  },
  {
    id: 4,
    name: 'Powdery Mildew',
    pathogen: 'Erysiphe cichoracearum',
    type: 'Fungal',
    severity: 'warning',
    crops: ['Wheat', 'Apple', 'Tomato'],
    emoji: '🌾',
    icon: FlaskConical,
    description: 'A widespread fungal disease creating a distinctive white powdery coating on plant surfaces. Unlike most fungi, it thrives in dry conditions with low humidity.',
    symptoms: [
      'White powdery coating on leaves and stems',
      'Yellowing of affected tissue',
      'Stunted growth and distorted shoots',
      'Premature leaf drop in severe cases',
    ],
    causes: ['Dry conditions with low humidity', 'Temperatures 20-25°C', 'Dense crop canopy', 'High nitrogen fertilization'],
    treatment: [
      'Apply sulfur-based fungicide or potassium bicarbonate',
      'Use systemic fungicides (triazoles) for severe infections',
      'Neem oil as organic alternative',
    ],
    prevention: ['Resistant varieties', 'Proper spacing for air circulation', 'Avoid excessive nitrogen', 'Remove plant debris'],
    spreadRate: 'High',
    color: '#eab308',
  },
  {
    id: 5,
    name: 'Rice Blast',
    pathogen: 'Magnaporthe oryzae',
    type: 'Fungal',
    severity: 'critical',
    crops: ['Rice'],
    emoji: '🌾',
    icon: Zap,
    description: 'The most destructive rice disease worldwide, capable of wiping out an entire crop. Also known as neck blast when it infects the panicle neck.',
    symptoms: [
      'Diamond/spindle-shaped gray lesions on leaves',
      'Brown borders with gray centers on spots',
      'Neck rot causing panicle to fall over ("neck blast")',
      'White or empty grains',
    ],
    causes: ['Temperatures 25-28°C', 'High humidity', 'Excess nitrogen application', 'Susceptible varieties'],
    treatment: [
      'Apply tricyclazole or isoprothiolane fungicide',
      'Drain field and leave dry for 3-5 days',
      'Avoid applying nitrogen during epidemic',
    ],
    prevention: ['Resistant varieties (top priority)', 'Balanced fertilization', 'Optimal plant spacing', 'Raise water level to suppress spores'],
    spreadRate: 'Very High',
    color: '#ef4444',
  },
  {
    id: 6,
    name: 'Leaf Spot',
    pathogen: 'Cercospora spp.',
    type: 'Fungal',
    severity: 'observation',
    crops: ['Tomato', 'Rice', 'Corn'],
    emoji: '🍃',
    icon: Eye,
    description: 'A group of fungal diseases causing characteristic spots on leaves. Generally not immediately life-threatening but can reduce yield through defoliation.',
    symptoms: [
      'Small, circular to angular spots on leaves',
      'Tan/gray centers with dark brown borders',
      'Spots may merge to form large blighted areas',
      'Premature yellowing and leaf drop',
    ],
    causes: ['Warm humid conditions', 'Extended leaf wetness', 'Infected seed or crop debris', 'Overcrowded planting'],
    treatment: [
      'Remove and destroy infected leaves',
      'Apply appropriate fungicide (copper, mancozeb)',
      'Improve plant spacing and air circulation',
    ],
    prevention: ['Use certified disease-free seed', 'Crop rotation', 'Avoid wetting foliage when irrigating', 'Maintain field hygiene'],
    spreadRate: 'Moderate',
    color: '#3b82f6',
  },
  {
    id: 7,
    name: 'Apple Scab',
    pathogen: 'Venturia inaequalis',
    type: 'Fungal',
    severity: 'warning',
    crops: ['Apple'],
    emoji: '🍎',
    icon: Shield,
    description: 'The most economically important apple disease globally. Primary infection occurs in spring during wet periods. Infected fruit becomes unmarketable.',
    symptoms: [
      'Olive-green to brown velvety spots on leaves',
      'Scabby, dark lesions on fruit surface',
      'Premature leaf and fruit drop',
      'Infected fruit may crack and become misshapen',
    ],
    causes: ['Wet spring weather', 'Temperatures 13-24°C during bud break', 'Primary inoculum from infected leaves', 'Susceptible varieties'],
    treatment: [
      'Apply fungicide during critical infection periods',
      'Use protective + systemic fungicide program',
      'Thin fruit to reduce disease severity',
    ],
    prevention: ['Plant resistant varieties', 'Rake and destroy fallen leaves', 'Prune canopy for air circulation', 'Dormant copper sprays'],
    spreadRate: 'Moderate',
    color: '#eab308',
  },
  {
    id: 8,
    name: 'Aphid Infestation',
    pathogen: 'Aphididae family',
    type: 'Pest',
    severity: 'warning',
    crops: ['Tomato', 'Potato', 'Wheat', 'Apple'],
    emoji: '🐛',
    icon: Bug,
    description: 'Tiny soft-bodied insects that pierce plant stems and leaves to suck sap. They multiply rapidly and also transmit viral diseases between plants.',
    symptoms: [
      'Curled or yellowed leaves',
      'Sticky honeydew residue on leaves',
      'Black sooty mold growing on honeydew',
      'Stunted or distorted new growth',
    ],
    causes: ['Warm temperatures', 'High nitrogen fertilization', 'Monoculture farming', 'Absence of natural predators'],
    treatment: [
      'Spray with neem oil or insecticidal soap',
      'Apply pyrethrin-based insecticide',
      'Introduce natural predators (ladybugs, lacewings)',
      'Strong water jet to dislodge colonies',
    ],
    prevention: ['Attract beneficial insects', 'Reflective mulches to deter aphids', 'Monitor weekly for early detection', 'Avoid excessive nitrogen use'],
    spreadRate: 'Very High',
    color: '#eab308',
  },
  {
    id: 9,
    name: 'Septoria Leaf Spot',
    pathogen: 'Septoria lycopersici',
    type: 'Fungal',
    severity: 'observation',
    crops: ['Tomato'],
    emoji: '🍅',
    icon: Droplets,
    description: 'One of the most common tomato diseases. Appears after the first fruits set and can cause significant defoliation if not managed early.',
    symptoms: [
      'Small circular spots with dark borders and tan/gray centers',
      'Tiny black specks (pycnidia) visible in lesion centers',
      'Lower leaves affected first, moves upward',
      'Severe defoliation in humid conditions',
    ],
    causes: ['Warm temperatures 20-25°C', 'Long periods of leaf wetness', 'High humidity', 'Infected soil or plant debris'],
    treatment: [
      'Remove infected leaves immediately',
      'Apply copper-based or mancozeb fungicide',
      'Ensure good drainage and air circulation',
    ],
    prevention: ['Rotate crops (2-3 years)', 'Mulch to prevent soil splash', 'Water at base of plant', 'Stake and prune plants'],
    spreadRate: 'Moderate',
    color: '#3b82f6',
  },
  {
    id: 10,
    name: 'Root Rot',
    pathogen: 'Pythium / Rhizoctonia spp.',
    type: 'Fungal',
    severity: 'critical',
    crops: ['Tomato', 'Potato', 'Corn', 'Rice', 'Wheat'],
    emoji: '🌱',
    icon: Thermometer,
    description: 'A soilborne disease complex affecting root systems. Plants may appear healthy above ground until the root system is severely compromised.',
    symptoms: [
      'Yellowing and wilting of leaves despite adequate water',
      'Dark brown or black discoloration of roots',
      'Root tissue soft and mushy',
      'Stunted plant growth and collapse',
    ],
    causes: ['Overwatering or waterlogged soil', 'Poor drainage', 'Heavy clay soils', 'Contaminated transplants or soil'],
    treatment: [
      'Improve drainage immediately',
      'Apply biological control agents (Trichoderma)',
      'Use soil drenches with metalaxyl or fosetyl-Al',
      'Remove and destroy severely affected plants',
    ],
    prevention: ['Well-drained soil essential', 'Avoid overwatering', 'Use raised beds in wet climates', 'Soil solarization before planting'],
    spreadRate: 'Moderate',
    color: '#ef4444',
  },
];

const HI_DISEASE_OVERRIDES = {
  1: {
    name: 'लेट ब्लाइट',
    description: 'यह एक गंभीर जल-फफूंद रोग है जो कुछ ही दिनों में पूरी फसल को नुकसान पहुंचा सकता है। ठंडे और गीले मौसम में तेजी से फैलता है।',
    symptoms: [
      'पत्तियों पर गहरे भूरे, पानी जैसे धब्बे',
      'पत्तियों की निचली सतह पर सफेद फफूंदी',
      'पत्तियों का तेजी से भूरा होकर सूखना',
      'फलों और कंदों में भूरा सड़न',
    ],
    causes: ['उच्च आर्द्रता (90% से अधिक)', 'तापमान 10-25°C', 'लंबे समय तक पत्तियों की नमी', 'कम वायु संचार'],
    treatment: [
      'तुरंत कॉपर या मैनकोजेब आधारित फफूंदनाशक का छिड़काव करें',
      'संक्रमित पौधों के हिस्से हटाकर नष्ट करें',
      'पौधों के बीच दूरी और वेंटिलेशन बेहतर करें',
      'ऊपरी सिंचाई से बचें',
    ],
    prevention: ['प्रतिरोधी किस्में लगाएं', '3-4 साल का फसल चक्र अपनाएं', 'घनी बुवाई से बचें', 'रोकथाम हेतु फफूंदनाशक का समय पर छिड़काव करें'],
  },
  2: {
    name: 'अर्ली ब्लाइट',
    description: 'यह सामान्य फफूंद रोग पत्तियों और तनों पर निशाने जैसी गोल आकृति बनाता है। पहले पुरानी पत्तियां प्रभावित होती हैं।',
    symptoms: [
      'गोल गहरे धब्बे जिनमें छल्लेदार पैटर्न दिखे',
      'धब्बों के चारों ओर पीला घेरा',
      'पहले नीचे या पुरानी पत्तियां प्रभावित',
      'समय से पहले पत्तियों का झड़ना',
    ],
    causes: ['गर्म तापमान 24-29°C', 'गीले और सूखे मौसम का क्रम', 'पौधों का तनाव (सूखा, पोषण कमी)', 'घनी छत्र संरचना'],
    treatment: [
      'क्लोरोथालोनिल या एज़ॉक्सीस्ट्रोबिन का छिड़काव करें',
      'नीचे की संक्रमित पत्तियां हटा दें',
      'संतुलित पोषण बनाए रखें',
      'हवा के प्रवाह के लिए पौधों को सहारा दें',
    ],
    prevention: ['मिट्टी पर मल्च लगाएं ताकि छींटे कम हों', 'संतुलित उर्वरक दें', 'जड़ के पास सिंचाई करें', 'फसल अवशेष नष्ट करें'],
  },
  3: {
    name: 'नॉर्दर्न लीफ ब्लाइट',
    description: 'मक्का का यह प्रमुख पर्ण रोग गंभीर स्थिति में 50-70% तक उपज घटा सकता है। लंबे सिगार जैसे धब्बे इसकी पहचान हैं।',
    symptoms: [
      'पत्तियों पर लंबे भूरे या स्लेटी अंडाकार धब्बे',
      'धब्बे 3-15 सेमी तक लंबे और अनियमित किनारों वाले',
      'धब्बों पर हरे-स्लेटी बीजाणु परत',
      'गंभीर स्थिति में पत्तियां जल्दी सूखना',
    ],
    causes: ['ठंडा तापमान 18-25°C', 'उच्च आर्द्रता', 'पत्तियों पर लंबे समय तक नमी', 'संवेदनशील हाइब्रिड'],
    treatment: [
      'VT अवस्था पर स्ट्रोबिल्यूरिन और ट्रायाजोल मिश्रित फफूंदनाशक दें',
      'सिल्किंग के बाद नियमित खेत निरीक्षण करें',
      'ऊपरी पत्तियों तक रोग पहुंचने से पहले छिड़काव करें',
    ],
    prevention: ['प्रतिरोधी हाइब्रिड लगाएं', 'फसल चक्र अपनाएं', 'अवशेष मिट्टी में मिलाएं', 'पौध घनत्व संतुलित रखें'],
  },
  4: {
    name: 'पाउडरी मिल्ड्यू',
    description: 'यह व्यापक फफूंद रोग पत्तियों पर सफेद चूर्ण जैसी परत बनाता है। कई अन्य फफूंद रोगों के विपरीत यह शुष्क मौसम में भी पनपता है।',
    symptoms: [
      'पत्तियों और तनों पर सफेद चूर्णीय परत',
      'प्रभावित ऊतक का पीला पड़ना',
      'विकास रुकना और नई टहनियों का विकृत होना',
      'गंभीर स्थिति में समय से पहले पत्तियां गिरना',
    ],
    causes: ['कम आर्द्रता वाला शुष्क मौसम', 'तापमान 20-25°C', 'घनी फसल छत्र', 'अधिक नाइट्रोजन उर्वरक'],
    treatment: [
      'सल्फर या पोटेशियम बाइकार्बोनेट आधारित छिड़काव करें',
      'गंभीर अवस्था में सिस्टमिक ट्रायाजोल का उपयोग करें',
      'जैविक विकल्प के रूप में नीम तेल का प्रयोग करें',
    ],
    prevention: ['प्रतिरोधी किस्में लगाएं', 'हवा के प्रवाह हेतु उचित दूरी रखें', 'अधिक नाइट्रोजन से बचें', 'संक्रमित अवशेष हटाएं'],
  },
  5: {
    name: 'राइस ब्लास्ट',
    description: 'धान का यह सबसे विनाशकारी रोग है जो पूरी फसल को नुकसान पहुंचा सकता है। गर्दन भाग पर संक्रमण होने पर इसे नेक ब्लास्ट भी कहते हैं।',
    symptoms: [
      'पत्तियों पर हीरे या धुरी आकार के स्लेटी धब्बे',
      'धब्बों के किनारे भूरे और बीच में स्लेटी केंद्र',
      'गर्दन सड़न से बालियां झुकना',
      'सफेद या खाली दाने',
    ],
    causes: ['तापमान 25-28°C', 'उच्च आर्द्रता', 'अधिक नाइट्रोजन उपयोग', 'संवेदनशील किस्में'],
    treatment: [
      'ट्राइसाइक्लाजोल या आइसोप्रोथियोलैन का छिड़काव करें',
      'खेत का पानी निकालकर 3-5 दिन सूखा रखें',
      'महामारी अवस्था में नाइट्रोजन देना रोकें',
    ],
    prevention: ['प्रतिरोधी किस्में प्राथमिकता से लगाएं', 'संतुलित उर्वरक प्रबंधन करें', 'उचित पौध दूरी रखें', 'बीजाणु दबाने हेतु जल स्तर संतुलित रखें'],
  },
  6: {
    name: 'लीफ स्पॉट',
    description: 'यह फफूंद रोग समूह पत्तियों पर विशिष्ट धब्बे बनाता है। सामान्यतः तुरंत जानलेवा नहीं होता, पर पत्ती झड़ने से उपज घट सकती है।',
    symptoms: [
      'पत्तियों पर छोटे गोल या कोणीय धब्बे',
      'हल्के केंद्र और गहरे भूरे किनारे',
      'धब्बे मिलकर बड़े जले क्षेत्र बना सकते हैं',
      'समय से पहले पीलापन और पत्ती झड़ना',
    ],
    causes: ['गर्म और नम मौसम', 'पत्तियों पर लंबे समय तक नमी', 'संक्रमित बीज या अवशेष', 'अत्यधिक घनी रोपाई'],
    treatment: [
      'संक्रमित पत्तियां हटाकर नष्ट करें',
      'उचित फफूंदनाशक (कॉपर, मैनकोजेब) लगाएं',
      'पौध दूरी और वायु संचार बढ़ाएं',
    ],
    prevention: ['प्रमाणित रोगमुक्त बीज उपयोग करें', 'फसल चक्र अपनाएं', 'सिंचाई में पत्तियां गीली करने से बचें', 'खेत की स्वच्छता बनाए रखें'],
  },
  7: {
    name: 'एप्पल स्कैब',
    description: 'सेब का यह आर्थिक रूप से महत्वपूर्ण रोग वसंत में गीले मौसम के दौरान तेजी से फैलता है। संक्रमित फल बाजार योग्य नहीं रहते।',
    symptoms: [
      'पत्तियों पर जैतूनी-भूरे मखमली धब्बे',
      'फल की सतह पर काले खुरदरे धब्बे',
      'पत्तियों और फलों का समय से पहले गिरना',
      'संक्रमित फल फट सकते हैं और आकार बिगड़ सकता है',
    ],
    causes: ['वसंत का गीला मौसम', 'कली फूटने पर 13-24°C तापमान', 'गिरी पत्तियों से प्राथमिक संक्रमण', 'संवेदनशील किस्में'],
    treatment: [
      'संक्रमण अवधि में समय पर फफूंदनाशक दें',
      'संरक्षी और सिस्टमिक दवाओं का संयोजन उपयोग करें',
      'फल पतलापन कर रोग तीव्रता कम करें',
    ],
    prevention: ['प्रतिरोधी किस्में चुनें', 'गिरी पत्तियां एकत्र कर नष्ट करें', 'वायु संचार हेतु छंटाई करें', 'सुप्तावस्था में कॉपर स्प्रे करें'],
  },
  8: {
    name: 'एफिड प्रकोप',
    description: 'एफिड छोटे नरम कीट हैं जो रस चूसते हैं। इनकी संख्या तेजी से बढ़ती है और ये वायरस रोग भी फैलाते हैं।',
    symptoms: [
      'पत्तियों का मुड़ना या पीला पड़ना',
      'पत्तियों पर चिपचिपा मधुरस',
      'मधुरस पर काला कालिखी फफूंद जमना',
      'नई बढ़वार का ठिगना या विकृत होना',
    ],
    causes: ['गर्म मौसम', 'अधिक नाइट्रोजन उर्वरक', 'एकल फसल खेती', 'प्राकृतिक शत्रुओं की कमी'],
    treatment: [
      'नीम तेल या कीटनाशी साबुन का छिड़काव करें',
      'पाइरेथ्रिन आधारित कीटनाशक का उपयोग करें',
      'लेडीबर्ड और लेसविंग जैसे लाभकारी कीट छोड़ें',
      'तेज पानी की धार से कॉलोनी हटाएं',
    ],
    prevention: ['लाभकारी कीट आकर्षित करें', 'एफिड रोकने के लिए रिफ्लेक्टिव मल्च लगाएं', 'साप्ताहिक निगरानी करें', 'अधिक नाइट्रोजन से बचें'],
  },
  9: {
    name: 'सेप्टोरिया लीफ स्पॉट',
    description: 'टमाटर का यह सामान्य रोग फल बनने के बाद दिखाई देता है और समय पर प्रबंधन न होने पर पत्तियां तेजी से झड़ सकती हैं।',
    symptoms: [
      'गहरे किनारों और हल्के केंद्र वाले छोटे गोल धब्बे',
      'धब्बों के केंद्र में छोटे काले बिंदु',
      'पहले निचली पत्तियां प्रभावित, फिर ऊपर फैलाव',
      'नम मौसम में भारी पत्ती झड़ना',
    ],
    causes: ['गर्म तापमान 20-25°C', 'पत्तियों पर लंबे समय तक नमी', 'उच्च आर्द्रता', 'संक्रमित मिट्टी या अवशेष'],
    treatment: [
      'संक्रमित पत्तियां तुरंत हटाएं',
      'कॉपर या मैनकोजेब आधारित फफूंदनाशक का छिड़काव करें',
      'बेहतर जल निकास और वायु संचार सुनिश्चित करें',
    ],
    prevention: ['2-3 साल का फसल चक्र अपनाएं', 'मिट्टी छींटे रोकने के लिए मल्च लगाएं', 'जड़ के पास सिंचाई करें', 'पौधों को सहारा देकर छंटाई करें'],
  },
  10: {
    name: 'रूट रॉट',
    description: 'यह मृदा जनित रोग समूह जड़ों को प्रभावित करता है। ऊपर से पौधा सामान्य दिख सकता है, जबकि जड़ प्रणाली अंदर से खराब हो रही होती है।',
    symptoms: [
      'पर्याप्त पानी होने पर भी पत्तियां पीली और मुरझाई',
      'जड़ों का गहरा भूरा या काला रंग',
      'जड़ ऊतक नरम और गलनयुक्त',
      'पौधे की बढ़वार रुकना और अंततः गिरना',
    ],
    causes: ['अधिक सिंचाई या जलभराव', 'खराब जल निकास', 'भारी चिकनी मिट्टी', 'संक्रमित रोपे या मिट्टी'],
    treatment: [
      'तुरंत जल निकास सुधारें',
      'ट्राइकोडर्मा जैसे जैव नियंत्रण एजेंट उपयोग करें',
      'मेटालैक्सिल या फोसेटिल-Al से मिट्टी ड्रेंच दें',
      'गंभीर संक्रमित पौधे हटाकर नष्ट करें',
    ],
    prevention: ['अच्छा जल निकास जरूरी रखें', 'अधिक पानी न दें', 'गीले क्षेत्रों में उभरी क्यारियां बनाएं', 'रोपाई से पहले सोलराइजेशन करें'],
  },
};

const HI_TO_MR_REPLACEMENTS = [
  ['फसल', 'पीक'],
  ['पत्तियां', 'पाने'],
  ['पत्तियों', 'पानां'],
  ['मिट्टी', 'माती'],
  ['सिंचाई', 'सिंचन'],
  ['रोग', 'आजार'],
  ['उपचार', 'उपाय'],
  ['कारण', 'कारणे'],
  ['निगरानी', 'निरिक्षण'],
  ['खेत', 'शेत'],
  ['संतुलित', 'समतोल'],
  ['अधिक', 'जास्त'],
  ['कम', 'कमी'],
  ['पानी', 'पाणी'],
  ['मौसम', 'हवामान'],
  ['जड़', 'मुळ'],
  ['लक्षण', 'लक्षणे'],
  ['फफूंद', 'बुरशी'],
  ['कीट', 'किड'],
];

const toMarathiText = (input) => {
  let output = input;
  HI_TO_MR_REPLACEMENTS.forEach(([from, to]) => {
    output = output.split(from).join(to);
  });
  return output;
};

const toMarathiValue = (value) => {
  if (typeof value === 'string') {
    return toMarathiText(value);
  }

  if (Array.isArray(value)) {
    return value.map((item) => toMarathiValue(item));
  }

  if (value && typeof value === 'object') {
    return Object.fromEntries(
      Object.entries(value).map(([key, item]) => [key, toMarathiValue(item)]),
    );
  }

  return value;
};

const CROPS = ['All', 'Tomato', 'Potato', 'Corn', 'Rice', 'Wheat', 'Apple'];
const TYPES = ['All', 'Fungal', 'Pest'];
const SEVERITIES = ['All', 'critical', 'warning', 'observation'];
const SEVERITY_META = {
  critical:    { labelKey: 'lib_severity_critical',     color: 'var(--status-critical)', bg: 'rgba(239,68,68,0.12)',  border: 'rgba(239,68,68,0.28)',  dot: '#ef4444' },
  warning:     { labelKey: 'lib_severity_warning',      color: 'var(--status-warning)',  bg: 'rgba(234,179,8,0.12)', border: 'rgba(234,179,8,0.28)', dot: '#eab308' },
  observation: { labelKey: 'lib_severity_low_risk',     color: 'var(--status-info)',     bg: 'rgba(59,130,246,0.12)', border: 'rgba(59,130,246,0.28)','dot': '#3b82f6' },
};
const SPREAD_COLOR = { 'Very High': '#ef4444', High: '#f97316', Moderate: '#eab308', Low: '#22c55e' };

const CROP_KEY_MAP = {
  Tomato: 'crop_tomato',
  Potato: 'crop_potato',
  Corn: 'crop_corn',
  Rice: 'crop_rice',
  Wheat: 'crop_wheat',
  Apple: 'crop_apple',
};

const TYPE_KEY_MAP = {
  Fungal: 'lib_type_fungal',
  Pest: 'lib_type_pest',
};

const SPREAD_KEY_MAP = {
  'Very High': 'lib_spread_very_high',
  High: 'lib_spread_high',
  Moderate: 'lib_spread_moderate',
  Low: 'lib_spread_low',
};

/* ─── Component ─────────────────────────────────────────────────── */
export default function DiseaseLibrary() {
  const { t, lang } = useLanguage();
  const [search, setSearch]         = useState('');
  const [filterCrop, setFilterCrop] = useState('All');
  const [filterType, setFilterType] = useState('All');
  const [filterSev, setFilterSev]   = useState('All');
  const [expanded, setExpanded]     = useState(null);
  const cropLabel = (crop) => t(CROP_KEY_MAP[crop] || crop);
  const typeLabel = (type) => t(TYPE_KEY_MAP[type] || type);
  const spreadLabel = (spread) => t(SPREAD_KEY_MAP[spread] || spread);

  const localizedDiseases = useMemo(() => {
    if (lang !== 'hi' && lang !== 'mr') {
      return DISEASES;
    }

    return DISEASES.map((disease) => {
      const baseOverride = HI_DISEASE_OVERRIDES[disease.id];
      const override = lang === 'mr' ? toMarathiValue(baseOverride) : baseOverride;
      return override ? { ...disease, ...override } : disease;
    });
  }, [lang]);

  const filtered = useMemo(() => {
    const q = search.toLowerCase();
    return localizedDiseases.filter(d => {
      const matchSearch = !q
        || d.name.toLowerCase().includes(q)
        || d.pathogen.toLowerCase().includes(q)
        || d.crops.some(c => c.toLowerCase().includes(q) || cropLabel(c).toLowerCase().includes(q))
        || d.symptoms.some(s => s.toLowerCase().includes(q));
      const matchCrop = filterCrop === 'All' || d.crops.includes(filterCrop);
      const matchType = filterType === 'All' || d.type === filterType;
      const matchSev  = filterSev  === 'All' || d.severity === filterSev;
      return matchSearch && matchCrop && matchType && matchSev;
    });
  }, [search, filterCrop, filterType, filterSev, localizedDiseases, cropLabel]);

  const toggle = (id) => setExpanded(prev => (prev === id ? null : id));

  return (
    <div className="library-page">
      {/* ── Header ─────────────────────────────────────────────── */}
      <div className="page-header animate-fade-in-up">
        <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
          <div className="library-header-icon">
            <BookMarked size={24} />
          </div>
          <div>
            <h1 className="heading-xl">{t('lib_title')}</h1>
            <p className="text-secondary" style={{ marginTop: 4 }}>{t('lib_subtitle')}</p>
          </div>
        </div>
        <div className="library-count-badge">
          {filtered.length} / {localizedDiseases.length} {t('lib_entries')}
        </div>
      </div>

      {/* ── Search ─────────────────────────────────────────────── */}
      <div className="library-search-wrap animate-fade-in-up" style={{ animationDelay: '60ms' }}>
        <Search size={18} className="library-search-icon" />
        <input
          id="library-search"
          className="library-search"
          type="text"
          placeholder={t('lib_search_placeholder')}
          value={search}
          onChange={e => setSearch(e.target.value)}
        />
        {search && (
          <button className="library-search-clear" onClick={() => setSearch('')}>
            <X size={15} />
          </button>
        )}
      </div>

      {/* ── Filters ────────────────────────────────────────────── */}
      <div className="library-filters animate-fade-in-up" style={{ animationDelay: '120ms' }}>
        {/* Crop filter */}
        <div className="library-filter-group">
          <span className="library-filter-label"><Leaf size={13} /> {t('lib_filter_crop')}</span>
          <div className="library-filter-pills">
            {CROPS.map(c => (
              <button
                key={c}
                className={`library-pill ${filterCrop === c ? 'active' : ''}`}
                onClick={() => setFilterCrop(c)}
              >{c === 'All' ? t('common_all') : cropLabel(c)}</button>
            ))}
          </div>
        </div>

        {/* Severity filter */}
        <div className="library-filter-group">
          <span className="library-filter-label"><AlertTriangle size={13} /> {t('lib_filter_severity')}</span>
          <div className="library-filter-pills">
            {SEVERITIES.map(s => {
              const meta = s !== 'All' ? SEVERITY_META[s] : null;
              return (
                <button
                  key={s}
                  className={`library-pill ${filterSev === s ? 'active' : ''}`}
                  style={meta && filterSev === s ? { color: meta.color, borderColor: meta.border, background: meta.bg } : {}}
                  onClick={() => setFilterSev(s)}
                >
                  {meta && <span className="lib-dot" style={{ background: meta.dot }} />}
                  {s === 'All' ? t('lib_all_levels') : t(meta.labelKey)}
                </button>
              );
            })}
          </div>
        </div>

        {/* Type filter */}
        <div className="library-filter-group">
          <span className="library-filter-label"><Bug size={13} /> {t('lib_filter_type')}</span>
          <div className="library-filter-pills">
            {TYPES.map(tp => (
              <button
                key={tp}
                className={`library-pill ${filterType === tp ? 'active' : ''}`}
                onClick={() => setFilterType(tp)}
              >{tp === 'All' ? t('lib_all_types') : typeLabel(tp)}</button>
            ))}
          </div>
        </div>
      </div>

      {/* ── Grid ───────────────────────────────────────────────── */}
      {filtered.length === 0 ? (
        <div className="library-empty animate-fade-in">
          <BookMarked size={52} strokeWidth={1.2} />
          <h3>{t('lib_no_results')}</h3>
          <p>{t('lib_no_results_desc')}</p>
          <button className="btn btn-secondary" onClick={() => { setSearch(''); setFilterCrop('All'); setFilterType('All'); setFilterSev('All'); }}>
            <X size={15} /> {t('lib_clear_filters')}
          </button>
        </div>
      ) : (
        <div className="library-grid stagger-children">
          {filtered.map((disease, idx) => {
            const meta = SEVERITY_META[disease.severity];
            const isOpen = expanded === disease.id;
            const Icon = disease.icon;
            return (
              <div
                key={disease.id}
                className={`library-card glass-card animate-fade-in-up ${isOpen ? 'library-card-open' : ''}`}
                style={{ animationDelay: `${idx * 50}ms`, borderLeftColor: disease.color }}
                id={`disease-card-${disease.id}`}
              >
                {/* Card Header */}
                <div className="library-card-header" onClick={() => toggle(disease.id)}>
                  <div className="library-card-icon" style={{ background: disease.color + '22', color: disease.color }}>
                    <Icon size={22} />
                  </div>
                  <div className="library-card-title-wrap">
                    <div className="library-card-name-row">
                      <span className="library-card-name">{disease.name}</span>
                      <span
                        className="library-sev-badge"
                        style={{ color: meta.color, background: meta.bg, border: `1px solid ${meta.border}` }}
                      >
                        {t(meta.labelKey)}
                      </span>
                    </div>
                    <span className="library-card-pathogen">{disease.pathogen} · {typeLabel(disease.type)}</span>
                    <div className="library-card-crops">
                      {disease.crops.map(c => (
                        <span key={c} className="library-crop-tag">{cropLabel(c)}</span>
                      ))}
                    </div>
                  </div>
                  <div className="library-card-meta">
                    <span className="library-spread" style={{ color: SPREAD_COLOR[disease.spreadRate] }}>
                      ⚡ {spreadLabel(disease.spreadRate)} {t('lib_spread_suffix')}
                    </span>
                    <button className="library-expand-btn">{isOpen ? <ChevronUp size={18} /> : <ChevronDown size={18} />}</button>
                  </div>
                </div>

                {/* Description (always visible) */}
                <p className="library-card-desc">{disease.description}</p>

                {/* Expanded details */}
                {isOpen && (
                  <div className="library-card-details animate-fade-in">
                    <div className="library-detail-grid">
                      {/* Symptoms */}
                      <div className="library-detail-section">
                        <h4 className="library-detail-heading">
                          <Eye size={14} /> {t('lib_section_symptoms')}
                        </h4>
                        <ul className="library-detail-list">
                          {disease.symptoms.map((s, i) => (
                            <li key={i}><span className="lib-bullet" style={{ background: disease.color }} />{s}</li>
                          ))}
                        </ul>
                      </div>

                      {/* Causes */}
                      <div className="library-detail-section">
                        <h4 className="library-detail-heading">
                          <Thermometer size={14} /> {t('lib_section_causes')}
                        </h4>
                        <ul className="library-detail-list">
                          {disease.causes.map((c, i) => (
                            <li key={i}><span className="lib-bullet" style={{ background: '#94a3b8' }} />{c}</li>
                          ))}
                        </ul>
                      </div>

                      {/* Treatment */}
                      <div className="library-detail-section">
                        <h4 className="library-detail-heading" style={{ color: '#10b981' }}>
                          <FlaskConical size={14} /> {t('lib_section_treatment')}
                        </h4>
                        <ul className="library-detail-list">
                          {disease.treatment.map((t, i) => (
                            <li key={i}><span className="lib-bullet" style={{ background: '#10b981' }} />{t}</li>
                          ))}
                        </ul>
                      </div>

                      {/* Prevention */}
                      <div className="library-detail-section">
                        <h4 className="library-detail-heading" style={{ color: '#3b82f6' }}>
                          <Shield size={14} /> {t('lib_section_prevention')}
                        </h4>
                        <ul className="library-detail-list">
                          {disease.prevention.map((p, i) => (
                            <li key={i}><span className="lib-bullet" style={{ background: '#3b82f6' }} />{p}</li>
                          ))}
                        </ul>
                      </div>
                    </div>
                  </div>
                )}

                <button
                  className="library-toggle-btn"
                  onClick={() => toggle(disease.id)}
                  id={`disease-toggle-${disease.id}`}
                >
                  {isOpen ? (
                    <><ChevronUp size={14} /> {t('lib_collapse')}</>
                  ) : (
                    <><ChevronDown size={14} /> {t('lib_expand')}</>
                  )}
                </button>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
