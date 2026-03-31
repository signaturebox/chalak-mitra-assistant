import { useLanguage } from "@/contexts/LanguageContext";
import { ArrowLeft, Calendar, FileText } from "lucide-react";
import { useState } from "react";

const nwrNotices = [
  {
    id: "1",
    date: "25 March 2026",
    subject: "Revised Speed Chart for Jodhpur-Jaisalmer Section",
    subjectHi: "जोधपुर-जैसलमेर खंड के लिए संशोधित गति चार्ट",
    body: `OFFICE ORDER No. NWR/Safety/2026/037

All concerned Loco Pilots and crew members are hereby informed about the revised Permanent Speed Restrictions (PSR) applicable on the Jodhpur–Jaisalmer section effective from 01 April 2026.

Revised Speed Restrictions:
1. Km 145.5 to Km 148.2 — 30 km/h (Sharp curve, Level Crossing)
2. Km 167.0 to Km 169.5 — 40 km/h (Bridge approach)
3. Km 201.3 to Km 203.0 — 25 km/h (Sand dune affected area)
4. Km 245.8 to Km 246.5 — 30 km/h (Station yard limit)
5. Km 289.0 to Km 291.0 — 45 km/h (Curve realignment work)

General Instructions:
• All crew members must carry updated PSR charts
• Speed restrictions are applicable for all types of trains
• Any violation will be treated as a serious safety breach
• Crew members must acknowledge receipt of this notice

This supersedes all previous speed charts for the mentioned section.

For and on behalf of North Western Railway.`,
    bodyHi: `कार्यालय आदेश संख्या NWR/Safety/2026/037

सभी संबंधित लोको पायलट और चालक दल के सदस्यों को सूचित किया जाता है कि जोधपुर-जैसलमेर खंड पर 01 अप्रैल 2026 से लागू संशोधित स्थायी गति प्रतिबंध (PSR) के बारे में।

संशोधित गति प्रतिबंध:
1. कि.मी. 145.5 से कि.मी. 148.2 — 30 कि.मी./घंटा (तीव्र मोड़, लेवल क्रॉसिंग)
2. कि.मी. 167.0 से कि.मी. 169.5 — 40 कि.मी./घंटा (पुल दृष्टिकोण)
3. कि.मी. 201.3 से कि.मी. 203.0 — 25 कि.मी./घंटा (रेत के टीले प्रभावित क्षेत्र)
4. कि.मी. 245.8 से कि.मी. 246.5 — 30 कि.मी./घंटा (स्टेशन यार्ड सीमा)
5. कि.मी. 289.0 से कि.मी. 291.0 — 45 कि.मी./घंटा (कर्व पुनर्संरेखण कार्य)

सामान्य निर्देश:
• सभी चालक दल के सदस्यों को अद्यतन PSR चार्ट रखना अनिवार्य है
• गति प्रतिबंध सभी प्रकार की ट्रेनों पर लागू हैं
• किसी भी उल्लंघन को गंभीर सुरक्षा उल्लंघन माना जाएगा
• चालक दल के सदस्यों को इस नोटिस की प्राप्ति की पावती देनी होगी

यह उक्त खंड के सभी पिछले गति चार्ट को अधिक्रमित करता है।

उत्तर पश्चिम रेलवे की ओर से।`,
    issuedBy: "Chief Safety Officer, NWR",
    issuedByHi: "मुख्य सुरक्षा अधिकारी, NWR",
    category: "Safety",
  },
  {
    id: "2",
    date: "10 March 2026",
    subject: "CLI Examination Schedule - April 2026",
    subjectHi: "CLI परीक्षा अनुसूची - अप्रैल 2026",
    body: `NOTICE No. NWR/Crew/CLI/2026/012

All eligible Loco Pilots (Goods) and Assistant Loco Pilots are informed that the CLI (Competency Level Improvement) examination for promotion will be conducted as per the following schedule:

Examination Schedule:
• Written Test: 15 April 2026 (10:00 AM - 01:00 PM)
• Practical Test: 16-17 April 2026
• Viva Voce: 18 April 2026

Examination Centers:
1. Jodhpur Diesel Shed
2. Ajmer Loco Shed
3. Bikaner Diesel Shed
4. Abu Road Electric Shed

Syllabus Coverage:
• GR & SR Rules (40 marks)
• Loco Technical Knowledge (30 marks)
• Safety & Emergency Procedures (20 marks)
• Air Brake System (10 marks)

Important Notes:
• Candidates must carry valid ID card and hall ticket
• Minimum 60% marks required for passing
• Previous CLI cleared candidates need not appear
• Application forms available at respective lobbies from 25 March 2026

All Division Personnel Officers are requested to circulate this notice widely.`,
    bodyHi: `सूचना संख्या NWR/Crew/CLI/2026/012

सभी पात्र लोको पायलट (माल) और सहायक लोको पायलट को सूचित किया जाता है कि पदोन्नति के लिए CLI (कंपिटेंसी लेवल इम्प्रूवमेंट) परीक्षा निम्नलिखित अनुसूची के अनुसार आयोजित की जाएगी:

परीक्षा अनुसूची:
• लिखित परीक्षा: 15 अप्रैल 2026 (प्रातः 10:00 - दोपहर 01:00)
• व्यावहारिक परीक्षा: 16-17 अप्रैल 2026
• मौखिक परीक्षा: 18 अप्रैल 2026

परीक्षा केंद्र:
1. जोधपुर डीज़ल शेड
2. अजमेर लोको शेड
3. बीकानेर डीज़ल शेड
4. आबू रोड इलेक्ट्रिक शेड

पाठ्यक्रम:
• GR & SR नियम (40 अंक)
• लोको तकनीकी ज्ञान (30 अंक)
• सुरक्षा और आपातकालीन प्रक्रियाएं (20 अंक)
• एयर ब्रेक सिस्टम (10 अंक)

महत्वपूर्ण नोट:
• उम्मीदवारों को वैध पहचान पत्र और हॉल टिकट लाना अनिवार्य है
• उत्तीर्ण होने के लिए न्यूनतम 60% अंक आवश्यक हैं
• पूर्व CLI उत्तीर्ण उम्मीदवारों को उपस्थित होने की आवश्यकता नहीं है
• आवेदन पत्र 25 मार्च 2026 से संबंधित लॉबी में उपलब्ध हैं

सभी डिवीजन कार्मिक अधिकारियों से अनुरोध है कि इस सूचना का व्यापक प्रसार करें।`,
    issuedBy: "CPO, North Western Railway",
    issuedByHi: "CPO, उत्तर पश्चिम रेलवे",
    category: "Examination",
  },
  {
    id: "3",
    date: "28 February 2026",
    subject: "Implementation of KAVACH System - Ajmer Division",
    subjectHi: "KAVACH प्रणाली का कार्यान्वयन - अजमेर डिवीजन",
    body: `CIRCULAR No. NWR/Signal/KAVACH/2026/005

All crew members operating in Ajmer Division are informed that the KAVACH (Train Collision Avoidance System) has been commissioned on the following sections:

Commissioned Sections:
• Ajmer - Beawar (48 km) — Effective from 15 March 2026
• Ajmer - Kishangarh (27 km) — Effective from 01 April 2026

Key Features of KAVACH:
• Automatic braking if speed exceeds permissible limit
• SOS messaging in case of emergency
• Automatic whistling at level crossings
• Real-time monitoring of train position

Instructions for Crew:
• All crew must undergo KAVACH familiarization training before operating in these sections
• Training schedule will be communicated by respective Lobby Managers
• Do NOT override KAVACH safety features under any circumstances
• Report any KAVACH system malfunction immediately

Training Contact: CRS Office, Ajmer - Ext. 2345`,
    bodyHi: `परिपत्र संख्या NWR/Signal/KAVACH/2026/005

अजमेर डिवीजन में संचालन करने वाले सभी चालक दल के सदस्यों को सूचित किया जाता है कि KAVACH (ट्रेन टक्कर निवारण प्रणाली) निम्नलिखित खंडों पर चालू कर दी गई है:

चालू खंड:
• अजमेर - ब्यावर (48 कि.मी.) — 15 मार्च 2026 से प्रभावी
• अजमेर - किशनगढ़ (27 कि.मी.) — 01 अप्रैल 2026 से प्रभावी

KAVACH की प्रमुख विशेषताएं:
• अनुमेय सीमा से अधिक गति होने पर स्वचालित ब्रेकिंग
• आपातकालीन स्थिति में SOS मैसेजिंग
• लेवल क्रॉसिंग पर स्वचालित सीटी
• ट्रेन की स्थिति की रियल-टाइम निगरानी

चालक दल के लिए निर्देश:
• इन खंडों में संचालन से पहले सभी चालक दल को KAVACH परिचय प्रशिक्षण से गुजरना अनिवार्य है
• प्रशिक्षण अनुसूची संबंधित लॉबी प्रबंधकों द्वारा सूचित की जाएगी
• किसी भी परिस्थिति में KAVACH सुरक्षा सुविधाओं को ओवरराइड न करें
• किसी भी KAVACH सिस्टम खराबी की तुरंत रिपोर्ट करें

प्रशिक्षण संपर्क: CRS कार्यालय, अजमेर - एक्सट. 2345`,
    issuedBy: "CSTE, North Western Railway",
    issuedByHi: "CSTE, उत्तर पश्चिम रेलवे",
    category: "Technical",
  },
];

export default function NWRNotices() {
  const { lang } = useLanguage();
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const selected = nwrNotices.find((n) => n.id === selectedId);

  const categoryColor = (cat: string) => {
    switch (cat) { case "Safety": return "bg-red-500/10 text-red-600"; case "Examination": return "bg-blue-500/10 text-blue-600"; default: return "bg-amber-500/10 text-amber-600"; }
  };

  if (selected) {
    return (
      <div className="space-y-4 animate-fade-in -mx-4 -mt-4 md:mx-0 md:mt-0">
        <div className="bg-gradient-to-br from-amber-700 to-amber-900 p-5 md:rounded-2xl">
          <button onClick={() => setSelectedId(null)} className="flex items-center gap-2 text-white/80 text-sm font-semibold mb-3">
            <ArrowLeft className="h-4 w-4" /> {lang === "hi" ? "सूचना सूची" : "All Notices"}
          </button>
          <h1 className="text-lg font-bold text-white">{lang === "hi" ? "NWR सूचना" : "NWR Notice"}</h1>
        </div>

        <div className="mx-4 md:mx-0 bg-card rounded-2xl border border-border/50 shadow-sm overflow-hidden">
          <div className="bg-gradient-to-b from-amber-50 to-white dark:from-amber-950/30 dark:to-card border-b border-border/30 p-6 text-center">
            <div className="text-5xl mb-2">🏛️</div>
            <p className="text-[10px] font-bold uppercase tracking-[0.3em] text-amber-800 dark:text-amber-400">
              {lang === "hi" ? "आधिकारिक सूचना" : "OFFICIAL NOTICE"}
            </p>
            <div className="w-24 h-0.5 bg-amber-600/30 mx-auto mt-2" />
            <p className="text-sm font-extrabold text-primary mt-3">
              {lang === "hi" ? "उत्तर पश्चिम रेलवे" : "North Western Railway"}
            </p>
          </div>

          <div className="p-5 space-y-4">
            <div className="flex items-center gap-2 flex-wrap">
              <span className={`px-2.5 py-1 rounded-lg text-[10px] font-bold ${categoryColor(selected.category)}`}>{selected.category}</span>
              <span className="text-xs text-muted-foreground flex items-center gap-1"><Calendar className="h-3 w-3" />{selected.date}</span>
            </div>
            <h2 className="text-base font-extrabold text-foreground">{lang === "hi" ? selected.subjectHi : selected.subject}</h2>
            <div className="text-sm text-foreground/90 whitespace-pre-line leading-relaxed">{lang === "hi" ? selected.bodyHi : selected.body}</div>
            <div className="pt-4 border-t border-border/30">
              <p className="text-sm font-bold text-foreground">{lang === "hi" ? selected.issuedByHi : selected.issuedBy}</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4 animate-fade-in -mx-4 -mt-4 md:mx-0 md:mt-0">
      <div className="bg-gradient-to-br from-amber-700 to-amber-900 p-5 md:rounded-2xl">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-white/20 flex items-center justify-center"><FileText className="h-5 w-5 text-white" /></div>
          <div>
            <p className="text-[10px] text-white/60 uppercase tracking-wider font-semibold">Official</p>
            <h1 className="text-base font-bold text-white">{lang === "hi" ? "NWR सूचनाएं" : "NWR Notices"}</h1>
          </div>
        </div>
      </div>

      <div className="px-4 md:px-0 space-y-3">
        {nwrNotices.map((notice) => (
          <button key={notice.id} onClick={() => setSelectedId(notice.id)}
            className="w-full bg-card rounded-2xl p-4 border border-border/50 shadow-sm text-left hover:shadow-md transition-all active:scale-[0.98]">
            <div className="flex items-start gap-3">
              <div className="w-12 h-12 rounded-full bg-amber-500/10 flex items-center justify-center text-2xl shrink-0">📋</div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <span className={`px-2 py-0.5 rounded text-[9px] font-bold ${categoryColor(notice.category)}`}>{notice.category}</span>
                </div>
                <p className="text-sm font-semibold text-foreground line-clamp-2">{lang === "hi" ? notice.subjectHi : notice.subject}</p>
                <p className="text-[10px] text-muted-foreground mt-1 flex items-center gap-1"><Calendar className="h-3 w-3" /> {notice.date} · {lang === "hi" ? notice.issuedByHi : notice.issuedBy}</p>
              </div>
            </div>
          </button>
        ))}
      </div>
    </div>
  );
}
