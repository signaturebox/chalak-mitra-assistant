import { useLanguage } from "@/contexts/LanguageContext";
import { ArrowLeft, Calendar, FileText } from "lucide-react";
import { useState } from "react";

const gmMessages = [
  {
    id: "1",
    date: "15 March 2026",
    subject: "Safety First - Zero Accident Mission",
    subjectHi: "सुरक्षा सर्वोपरि - शून्य दुर्घटना मिशन",
    body: `Dear Railway Family,

It gives me immense pride to address all the Loco Pilots, Assistant Loco Pilots, and crew members of North Western Railway.

Safety has always been and will continue to be our topmost priority. I urge each one of you to follow all safety protocols diligently. Remember, every trip you make safely brings joy to thousands of families.

Key points to remember:
• Always perform thorough brake tests before departure
• Follow speed restrictions without exception
• Report any track or equipment anomalies immediately
• Stay alert during fog and adverse weather conditions
• Maintain proper communication with station staff and TPC

Together, we can achieve our goal of ZERO accidents. Your dedication and professionalism are the backbone of Indian Railways.

With warm regards and best wishes,`,
    bodyHi: `प्रिय रेलवे परिवार,

उत्तर पश्चिम रेलवे के सभी लोको पायलट, सहायक लोको पायलट और चालक दल के सदस्यों को संबोधित करते हुए मुझे अत्यंत गर्व हो रहा है।

सुरक्षा हमेशा से हमारी सर्वोच्च प्राथमिकता रही है और रहेगी। मैं आप सभी से अनुरोध करता हूँ कि सभी सुरक्षा प्रोटोकॉल का पूरी लगन से पालन करें। याद रखें, आपकी हर सुरक्षित यात्रा हजारों परिवारों को खुशी देती है।

याद रखने योग्य मुख्य बिंदु:
• प्रस्थान से पहले हमेशा पूर्ण ब्रेक परीक्षण करें
• गति प्रतिबंधों का बिना किसी अपवाद के पालन करें
• ट्रैक या उपकरण की किसी भी विसंगति की तुरंत रिपोर्ट करें
• कोहरे और प्रतिकूल मौसम की स्थिति में सतर्क रहें
• स्टेशन स्टाफ और TPC के साथ उचित संपर्क बनाए रखें

हम मिलकर शून्य दुर्घटना के लक्ष्य को प्राप्त कर सकते हैं। आपका समर्पण और व्यावसायिकता भारतीय रेलवे की रीढ़ है।

सादर और शुभकामनाओं के साथ,`,
    gmName: "Shri Manish Khandelwal",
    gmNameHi: "श्री मनीष खंडेलवाल",
    gmTitle: "General Manager, North Western Railway",
    gmTitleHi: "महाप्रबंधक, उत्तर पश्चिम रेलवे",
  },
  {
    id: "2",
    date: "01 January 2026",
    subject: "New Year Message - Commitment to Excellence",
    subjectHi: "नव वर्ष संदेश - उत्कृष्टता के प्रति प्रतिबद्धता",
    body: `Dear Officers and Staff,

As we step into the New Year 2026, I extend my heartfelt greetings to all members of the NWR family.

The past year has been one of remarkable achievements. Our punctuality improved significantly, and we achieved new milestones in freight loading. This was possible only because of your tireless efforts.

In the coming year, let us resolve to:
• Enhance passenger amenities further
• Achieve higher standards of cleanliness
• Embrace digital technologies for efficient operations
• Continue our commitment to safety

Wishing you and your families a prosperous and healthy New Year.`,
    bodyHi: `प्रिय अधिकारियों और कर्मचारियों,

जैसे ही हम नव वर्ष 2026 में कदम रख रहे हैं, मैं NWR परिवार के सभी सदस्यों को हार्दिक शुभकामनाएं देता हूँ।

बीता वर्ष उल्लेखनीय उपलब्धियों का रहा है। हमारी समय-पालन में उल्लेखनीय सुधार हुआ और हमने माल ढुलाई में नए मील के पत्थर हासिल किए। यह केवल आपके अथक प्रयासों से संभव हुआ।

आने वाले वर्ष में, हम संकल्प लें:
• यात्री सुविधाओं को और बढ़ाएं
• स्वच्छता के उच्चतर मानक प्राप्त करें
• कुशल संचालन के लिए डिजिटल प्रौद्योगिकियों को अपनाएं
• सुरक्षा के प्रति अपनी प्रतिबद्धता जारी रखें

आपको और आपके परिवार को समृद्ध और स्वस्थ नव वर्ष की शुभकामनाएं।`,
    gmName: "Shri Manish Khandelwal",
    gmNameHi: "श्री मनीष खंडेलवाल",
    gmTitle: "General Manager, North Western Railway",
    gmTitleHi: "महाप्रबंधक, उत्तर पश्चिम रेलवे",
  },
];

export default function GMMessages() {
  const { lang } = useLanguage();
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const selected = gmMessages.find((m) => m.id === selectedId);

  if (selected) {
    return (
      <div className="space-y-4 animate-fade-in -mx-4 -mt-4 md:mx-0 md:mt-0">
        {/* Header */}
        <div className="railway-gradient p-5 md:rounded-2xl">
          <button
            onClick={() => setSelectedId(null)}
            className="flex items-center gap-2 text-white/80 text-sm font-semibold mb-3"
          >
            <ArrowLeft className="h-4 w-4" /> {lang === "hi" ? "संदेश सूची" : "All Messages"}
          </button>
          <h1 className="text-lg font-bold text-white">
            {lang === "hi" ? "महाप्रबंधक संदेश" : "GM Message"}
          </h1>
        </div>

        {/* Official Letter */}
        <div className="mx-4 md:mx-0 bg-card rounded-2xl border border-border/50 shadow-sm overflow-hidden">
          {/* Ashok Emblem Header */}
          <div className="bg-gradient-to-b from-amber-50 to-white dark:from-amber-950/30 dark:to-card border-b border-border/30 p-6 text-center">
            <div className="text-5xl mb-2">🏛️</div>
            <p className="text-[10px] font-bold uppercase tracking-[0.3em] text-amber-800 dark:text-amber-400">
              {lang === "hi" ? "सत्यमेव जयते" : "SATYAMEVA JAYATE"}
            </p>
            <div className="w-24 h-0.5 bg-amber-600/30 mx-auto mt-2" />
            <p className="text-xs font-bold text-foreground mt-3 uppercase tracking-wider">
              {lang === "hi" ? "भारत सरकार" : "Government of India"}
            </p>
            <p className="text-[10px] text-muted-foreground">
              {lang === "hi" ? "रेल मंत्रालय" : "Ministry of Railways"}
            </p>
            <p className="text-sm font-extrabold text-primary mt-1">
              {lang === "hi" ? "उत्तर पश्चिम रेलवे" : "North Western Railway"}
            </p>
          </div>

          {/* GM Info */}
          <div className="flex items-center gap-4 p-5 border-b border-border/30">
            <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center text-3xl shrink-0 border-2 border-primary/20">
              👤
            </div>
            <div>
              <p className="text-base font-extrabold text-foreground">
                {lang === "hi" ? selected.gmNameHi : selected.gmName}
              </p>
              <p className="text-xs text-muted-foreground">
                {lang === "hi" ? selected.gmTitleHi : selected.gmTitle}
              </p>
            </div>
          </div>

          {/* Letter Content */}
          <div className="p-5 space-y-4">
            <div className="flex items-center gap-2 text-xs text-muted-foreground">
              <Calendar className="h-3.5 w-3.5" />
              {selected.date}
            </div>
            <h2 className="text-base font-extrabold text-foreground">
              {lang === "hi" ? selected.subjectHi : selected.subject}
            </h2>
            <div className="text-sm text-foreground/90 whitespace-pre-line leading-relaxed">
              {lang === "hi" ? selected.bodyHi : selected.body}
            </div>
            <div className="pt-4 border-t border-border/30">
              <p className="text-sm font-bold text-foreground">
                {lang === "hi" ? selected.gmNameHi : selected.gmName}
              </p>
              <p className="text-xs text-muted-foreground">
                {lang === "hi" ? selected.gmTitleHi : selected.gmTitle}
              </p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4 animate-fade-in -mx-4 -mt-4 md:mx-0 md:mt-0">
      {/* Header */}
      <div className="railway-gradient p-5 md:rounded-2xl">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-white/20 flex items-center justify-center">
            <FileText className="h-5 w-5 text-white" />
          </div>
          <div>
            <p className="text-[10px] text-white/60 uppercase tracking-wider font-semibold">Official</p>
            <h1 className="text-base font-bold text-white">
              {lang === "hi" ? "महाप्रबंधक संदेश" : "GM Messages"}
            </h1>
          </div>
        </div>
      </div>

      {/* Messages List */}
      <div className="px-4 md:px-0 space-y-3">
        {gmMessages.map((msg) => (
          <button
            key={msg.id}
            onClick={() => setSelectedId(msg.id)}
            className="w-full bg-card rounded-2xl p-4 border border-border/50 shadow-sm text-left hover:shadow-md transition-all active:scale-[0.98]"
          >
            <div className="flex items-start gap-3">
              <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center text-2xl shrink-0">
                👤
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-extrabold text-foreground">
                  {lang === "hi" ? msg.gmNameHi : msg.gmName}
                </p>
                <p className="text-[10px] text-muted-foreground">
                  {lang === "hi" ? msg.gmTitleHi : msg.gmTitle}
                </p>
                <p className="text-sm font-semibold text-foreground mt-2 line-clamp-2">
                  {lang === "hi" ? msg.subjectHi : msg.subject}
                </p>
                <p className="text-[10px] text-muted-foreground mt-1 flex items-center gap-1">
                  <Calendar className="h-3 w-3" /> {msg.date}
                </p>
              </div>
            </div>
          </button>
        ))}
      </div>
    </div>
  );
}
