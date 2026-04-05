/**
 * Extended Locomotive Data for Chalak Mitra
 * Includes Conventional, Diesel, WAG12, and Vande Bharat (T-18)
 */

window.CONVENTIONAL_LOCO_DATA = {
    subsystem: "Conventional Electric Locomotive",
    procedures: {
        'CONV_ENERGIZE': {
            code: 'CONV-01',
            message: 'लोको इनरजाइज करना (Energizing Conventional Loco)',
            description: 'Standard procedure for Conventional Electric Loco setup',
            troubleshooting: [
                'HBA को "0" से "1" पर रखें, ZUBA से बैटरी वोल्टेज 90V+ चेक करें।',
                'RAL कॉक खोलकर RS प्रेशर 7.0 Kg/cm² चेक करें (CPA चलाकर 8.0 बनाएँ)।',
                'BL अनलॉक करें: LSDJ, LSCHBA, LSGR, LSB प्रकाशित होंगे।',
                'ZPT चाबी सॉकेट में "0" से "1" करें, पेन्टो रेज़ चेक करें।',
                'BLDJ क्लोज करें, BLRDJ प्रेस करें: LSDJ बुझना चाहिए, UA मीटर डेविएट होगा।',
                'BLCP क्लोज कर MR 9.5 Kg/cm² प्रेशर बनाएँ।',
                'BLVMT क्लोज कर सभी ब्लोअर चेक करें।'
            ]
        },
        'CONV_CAB_CHANGE': {
            code: 'CONV-02',
            message: 'कैब बदलना (Cab Change)',
            description: 'Transition between cabs in Conventional Loco',
            troubleshooting: [
                'SA-9 फुल (3.5 Kg/cm²) लगायें।',
                'A-9 व SA-9 के चारों कट-आउट कॉक बंद करें।',
                'DJ/VCB ओपन करें, पेन्टो लोअर करें, MPJ "0" पर रखें, BL लॉक करें।',
                'दूसरी कैब में SA-9 लगायें, कॉक खोलें, सामान्य इनरजाइज प्रक्रिया दोहराएँ।'
            ]
        },
        'CONV_DEAD_LOCO': {
            code: 'CONV-03',
            message: 'लोको को डेड बनाने की विधि',
            description: 'Procedure to make loco dead for hauling',
            troubleshooting: [
                'A-9 इमरजेंसी (BP "0"), SA-9 (3.5 Kg) प्रेशर सुनिश्चित करें।',
                'DJ ओपन, पेन्टो लोअर, बैटरी ऑफ (HBA-0)।',
                'BP/FP चार्जिंग कॉक और IP COC बंद करें।',
                'रिवर्सर (J-1, J-2) न्यूट्रल पर लॉक करें।'
            ]
        }
    }
};

window.DIESEL_LOCO_DATA = {
    subsystem: "Diesel Locomotive (ALCO/HHP)",
    procedures: {
        'DIESEL_CRANK_FAIL': {
            code: 'DSL-01',
            message: 'इंजन क्रैंक होता है पर स्टार्ट नहीं होता',
            description: 'Troubleshooting for Diesel engine startup failure',
            troubleshooting: [
                'EPD/OSTA ट्रिप चेक करें: LWS (पानी लेवल) रीसेट करें, LLOB रीसेट करें।',
                'Fuel rake जाम: Lay shaft को 2-3 बार दबाएँ।',
                'Fuel site glass: बुलबुले आने पर फिल्टर टाइट करें।',
                '804B (Low Engine Oil): तेल मात्रा चेक कर LLOB रीसेट करें।'
            ]
        },
        'DIESEL_TE_LOSS': {
            code: 'DSL-02',
            message: 'Tractive Effort (TE) नहीं मिलता',
            description: 'No power even when engine is running',
            troubleshooting: [
                'PCS knocked out: MR प्रेशर और ऑटो ब्रेक हैंडल चेक कर रिकवर करें।',
                'ECC2: AGFB या GF स्विच चेक करें (ऑन/रीसेट करें)।',
                'Code 620: रिवर्सर न्यूट्रल, थ्रॉटल आइडल, TCC ब्रेकर रीसायकल करें।'
            ]
        }
    }
};

window.WAG12_LOCO_DATA = {
    subsystem: "WAG12 (Alstom)",
    procedures: {
        'WAG12_BP_FAIL': {
            code: 'W12-11',
            message: 'BP नहीं बन रहा (BP Pressure Failure)',
            description: 'Troubleshooting for WAG12 Braking System',
            troubleshooting: [
                'EBV ऑटो हैंडल, EB बटन, ALP इमरजेंसी कॉक रिलीज स्थिति चेक करें।',
                'N98 वाल्व (अंडरफ्रेम) लीकेज होने पर BCM का EB कॉक (N55.5) बंद करें।',
                'EBV डिस्प्ले के निर्देशों का पालन करें।',
                'पार्किंग ब्रेक रिलीज है सुनिश्चित करें (प्लन्जर खींचकर)।'
            ]
        },
        'WAG12_BACKUP_BRAKE': {
            code: 'W12-08',
            message: 'बैकअप ब्रेक का उपयोग (Backup Brake Use)',
            description: 'How to use backup brake in case of EBV failure',
            troubleshooting: [
                'BCM का सर्किट ब्रेकर 62Q06 (LVC) ट्रिप करें।',
                'PER-COS कॉक CUT-IN पोजीशन पर रखें।',
                'बैकअप ब्रेक हैंडल लैप (III) पर रखें।',
                'डिस्ट्रीब्यूटर वाल्व (KE) के नीचे क्विक रिलीज लीवर खींचें।'
            ]
        }
    }
};

window.VANDE_BHARAT_DATA = {
    subsystem: "Vande Bharat (T-18)",
    procedures: {
        'VB_RDM_MODE': {
            code: 'VB-RDM',
            message: 'RDM मोड में संचालन (Redundancy Mode)',
            description: 'Operating in case of TCN/Communication failure',
            troubleshooting: [
                'गाड़ी रोकें, मास्टर 0, Rev न्यूट्रल।',
                '10 सेकंड बाद मास्टर Key को RDM पर घुमाएँ।',
                'RDM लैप जलने पर अधिकतम 60 KMPH से चलाएँ।'
            ]
        },
        'VB_DEAD_TRAIN': {
            code: 'VB-DEAD',
            message: 'डेड ट्रेन बनाना (Dead Train Hauling)',
            description: 'Moving Vande Bharat using a helper loco',
            troubleshooting: [
                'CBC कपलर जोड़कर सेफ्टी पिन लगाएँ।',
                'BPTC (Brake Isolation Cock) बंद करें।',
                'कोच के EPIC कॉक और पार्किंग ब्रेक कॉक बंद करें।',
                'व्हील 1-4, 5-8 पर पार्किंग ब्रेक मैनुअली रिलीज़ करें।'
            ]
        }
    }
};
