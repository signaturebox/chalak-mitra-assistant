import { useLanguage } from "@/contexts/LanguageContext";
import { ArrowLeft, Calendar, FileText } from "lucide-react";
import { useState } from "react";

const pceeMessages = [
  {
    id: "1",
    date: "20 March 2026",
    subject: "Monsoon Preparedness - Loco Maintenance Guidelines",
    subjectHi: "मानसून तैयारी - लोको रखरखाव दिशानिर्देश",
    body: `To All Loco Pilots and Crew Members,

As the monsoon season approaches, it is imperative that all crew members exercise extra caution and follow the guidelines issued for safe train operations during adverse weather conditions.

Important Instructions:
• Check all electrical connections and insulation before every trip
• Ensure proper functioning of wipers and headlights
• Report any waterlogging on tracks immediately to TPC
• Reduce speed in sections prone to flooding
• Check brake pipe pressure frequently during heavy rain
• Be vigilant for track washouts and landslides in ghat sections

Loco Maintenance Reminders:
• Ensure all roof-mounted equipment covers are properly sealed
• Check traction motor ventilation systems for blockages
• Verify proper functioning of earth fault relay
• Test all emergency equipment including fire extinguishers
• Report any unusual sounds or vibrations immediately

All shed staff must ensure that locos dispatched during monsoon have undergone thorough weather preparedness checks.

Safety is non-negotiable. Follow all speed restrictions and caution orders without exception.`,
    bodyHi: `सभी लोको पायलट और चालक दल के सदस्यों को,

मानसून का मौसम निकट आ रहा है, यह अनिवार्य है कि सभी चालक दल के सदस्य अतिरिक्त सावधानी बरतें और प्रतिकूल मौसम की स्थिति में सुरक्षित ट्रेन संचालन के लिए जारी दिशानिर्देशों का पालन करें।

महत्वपूर्ण निर्देश:
• प्रत्येक यात्रा से पहले सभी विद्युत कनेक्शन और इंसुलेशन की जाँच करें
• वाइपर और हेडलाइट की उचित कार्यप्रणाली सुनिश्चित करें
• ट्रैक पर जलभराव की तुरंत TPC को रिपोर्ट करें
• बाढ़ प्रवण खंडों में गति कम करें
• भारी बारिश के दौरान ब्रेक पाइप प्रेशर की बार-बार जाँच करें
• घाट खंडों में ट्रैक वॉशआउट और भूस्खलन के लिए सतर्क रहें

लोको रखरखाव अनुस्मारक:
• सुनिश्चित करें कि छत पर लगे उपकरणों के कवर ठीक से सील हैं
• ट्रैक्शन मोटर वेंटिलेशन सिस्टम में रुकावट की जाँच करें
• अर्थ फॉल्ट रिले की उचित कार्यप्रणाली सत्यापित करें
• अग्निशामक सहित सभी आपातकालीन उपकरणों का परीक्षण करें
• किसी भी असामान्य ध्वनि या कंपन की तुरंत रिपोर्ट करें

सभी शेड कर्मचारी सुनिश्चित करें कि मानसून के दौरान भेजे गए लोको की पूर्ण मौसम तैयारी जाँच हो चुकी है।

सुरक्षा पर कोई समझौता नहीं। सभी गति प्रतिबंधों और सावधानी आदेशों का बिना किसी अपवाद के पालन करें।`,
    officerName: "Shri Rajesh Kumar Sharma",
    officerNameHi: "श्री राजेश कुमार शर्मा",
    officerTitle: "PCEE, North Western Railway",
    officerTitleHi: "PCEE, उत्तर पश्चिम रेलवे",
  },
  {
    id: "2",
    date: "05 February 2026",
    subject: "Energy Conservation and Efficient Loco Operation",
    subjectHi: "ऊर्जा संरक्षण और कुशल लोको संचालन",
    body: `Dear Crew Members,

Energy conservation is a national priority. As operators of heavy traction equipment, loco pilots play a crucial role in reducing energy consumption.

Energy Saving Tips:
• Use coasting technique on downhill gradients
• Avoid unnecessary idling of diesel locomotives
• Use regenerative braking wherever applicable
• Maintain optimal notch operation
• Plan acceleration and deceleration efficiently
• Switch off hotel load equipment when not required

Performance Parameters:
• Target SEC (Specific Energy Consumption) for electric locos: ≤ 25 kWh/1000 GTK
• Target SFC (Specific Fuel Consumption) for diesel locos: ≤ 4.5 lit/1000 GTK

Crew members demonstrating exceptional energy conservation will be recognized and rewarded.

Let us all contribute to a greener and more efficient railway.`,
    bodyHi: `प्रिय चालक दल के सदस्यों,

ऊर्जा संरक्षण एक राष्ट्रीय प्राथमिकता है। भारी ट्रैक्शन उपकरणों के संचालक के रूप में, लोको पायलट ऊर्जा खपत को कम करने में महत्वपूर्ण भूमिका निभाते हैं।

ऊर्जा बचत युक्तियाँ:
• नीचे की ढलान पर कोस्टिंग तकनीक का उपयोग करें
• डीज़ल लोकोमोटिव की अनावश्यक आइडलिंग से बचें
• जहाँ भी लागू हो, रीजनरेटिव ब्रेकिंग का उपयोग करें
• इष्टतम नॉच संचालन बनाए रखें
• त्वरण और मंदन की कुशलतापूर्वक योजना बनाएं
• आवश्यकता न होने पर होटल लोड उपकरण बंद करें

प्रदर्शन मापदंड:
• विद्युत लोको के लिए लक्ष्य SEC: ≤ 25 kWh/1000 GTK
• डीज़ल लोको के लिए लक्ष्य SFC: ≤ 4.5 लीटर/1000 GTK

असाधारण ऊर्जा संरक्षण प्रदर्शित करने वाले चालक दल के सदस्यों को मान्यता और पुरस्कार दिया जाएगा।

आइए हम सभी एक हरित और अधिक कुशल रेलवे में योगदान दें।`,
    officerName: "Shri Rajesh Kumar Sharma",
    officerNameHi: "श्री राजेश कुमार शर्मा",
    officerTitle: "PCEE, North Western Railway",
    officerTitleHi: "PCEE, उत्तर पश्चिम रेलवे",
  },
];

export default function PCEEMessages() {
  const { lang } = useLanguage();
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const selected = pceeMessages.find((m) => m.id === selectedId);

  if (selected) {
    return (
      <div className="space-y-4 animate-fade-in -mx-4 -mt-4 md:mx-0 md:mt-0">
        <div className="bg-gradient-to-br from-emerald-700 to-emerald-900 p-5 md:rounded-2xl">
          <button onClick={() => setSelectedId(null)} className="flex items-center gap-2 text-white/80 text-sm font-semibold mb-3">
            <ArrowLeft className="h-4 w-4" /> {lang === "hi" ? "संदेश सूची" : "All Messages"}
          </button>
          <h1 className="text-lg font-bold text-white">{lang === "hi" ? "PCEE संदेश" : "PCEE Message"}</h1>
        </div>

        <div className="mx-4 md:mx-0 bg-card rounded-2xl border border-border/50 shadow-sm overflow-hidden">
          <div className="bg-gradient-to-b from-emerald-50 to-white dark:from-emerald-950/30 dark:to-card border-b border-border/30 p-6 text-center">
            <div className="text-5xl mb-2">⚙️</div>
            <p className="text-[10px] font-bold uppercase tracking-[0.3em] text-emerald-800 dark:text-emerald-400">
              {lang === "hi" ? "विद्युत विभाग" : "ELECTRICAL DEPARTMENT"}
            </p>
            <div className="w-24 h-0.5 bg-emerald-600/30 mx-auto mt-2" />
            <p className="text-sm font-extrabold text-primary mt-3">
              {lang === "hi" ? "उत्तर पश्चिम रेलवे" : "North Western Railway"}
            </p>
          </div>

          <div className="flex items-center gap-4 p-5 border-b border-border/30">
            <div className="w-16 h-16 rounded-full bg-emerald-500/10 flex items-center justify-center text-3xl shrink-0 border-2 border-emerald-500/20">👤</div>
            <div>
              <p className="text-base font-extrabold text-foreground">{lang === "hi" ? selected.officerNameHi : selected.officerName}</p>
              <p className="text-xs text-muted-foreground">{lang === "hi" ? selected.officerTitleHi : selected.officerTitle}</p>
            </div>
          </div>

          <div className="p-5 space-y-4">
            <div className="flex items-center gap-2 text-xs text-muted-foreground"><Calendar className="h-3.5 w-3.5" />{selected.date}</div>
            <h2 className="text-base font-extrabold text-foreground">{lang === "hi" ? selected.subjectHi : selected.subject}</h2>
            <div className="text-sm text-foreground/90 whitespace-pre-line leading-relaxed">{lang === "hi" ? selected.bodyHi : selected.body}</div>
            <div className="pt-4 border-t border-border/30">
              <p className="text-sm font-bold text-foreground">{lang === "hi" ? selected.officerNameHi : selected.officerName}</p>
              <p className="text-xs text-muted-foreground">{lang === "hi" ? selected.officerTitleHi : selected.officerTitle}</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4 animate-fade-in -mx-4 -mt-4 md:mx-0 md:mt-0">
      <div className="bg-gradient-to-br from-emerald-700 to-emerald-900 p-5 md:rounded-2xl">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-white/20 flex items-center justify-center"><FileText className="h-5 w-5 text-white" /></div>
          <div>
            <p className="text-[10px] text-white/60 uppercase tracking-wider font-semibold">Official</p>
            <h1 className="text-base font-bold text-white">{lang === "hi" ? "PCEE संदेश" : "PCEE Messages"}</h1>
          </div>
        </div>
      </div>

      <div className="px-4 md:px-0 space-y-3">
        {pceeMessages.map((msg) => (
          <button key={msg.id} onClick={() => setSelectedId(msg.id)}
            className="w-full bg-card rounded-2xl p-4 border border-border/50 shadow-sm text-left hover:shadow-md transition-all active:scale-[0.98]">
            <div className="flex items-start gap-3">
              <div className="w-12 h-12 rounded-full bg-emerald-500/10 flex items-center justify-center text-2xl shrink-0">👤</div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-extrabold text-foreground">{lang === "hi" ? msg.officerNameHi : msg.officerName}</p>
                <p className="text-[10px] text-muted-foreground">{lang === "hi" ? msg.officerTitleHi : msg.officerTitle}</p>
                <p className="text-sm font-semibold text-foreground mt-2 line-clamp-2">{lang === "hi" ? msg.subjectHi : msg.subject}</p>
                <p className="text-[10px] text-muted-foreground mt-1 flex items-center gap-1"><Calendar className="h-3 w-3" /> {msg.date}</p>
              </div>
            </div>
          </button>
        ))}
      </div>
    </div>
  );
}
