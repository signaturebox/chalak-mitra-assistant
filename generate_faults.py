
import json
import os

base_dir = r"C:\Users\USER\Desktop\nwr chalak\3phse loco"
ss01_path = os.path.join(base_dir, "SS01.json")
ss01b_path = os.path.join(base_dir, "SS01b.json")
ss02_path = os.path.join(base_dir, "SS02.json")
ss03_path = os.path.join(base_dir, "SS03.json")
ss04_path = os.path.join(base_dir, "SS04.json")
ss05_path = os.path.join(base_dir, "SS05.json")
tsd_json_path = os.path.join(base_dir, "3 phase fault tsd.json")
output_path = r"C:\Users\USER\Desktop\nwr chalak\js\data\threePhaseLocoFaults.js"

def load_json(path):
    if not os.path.exists(path):
        print(f"Warning: {path} not found.")
        return None
    with open(path, 'r', encoding='utf-8') as f:
        return json.load(f)

# Load Data
ss01_data = load_json(ss01_path)
ss01b_data = load_json(ss01b_path)
ss02_data = load_json(ss02_path)
ss03_data = load_json(ss03_path)
ss04_data = load_json(ss04_path)
ss05_data = load_json(ss05_path)
tsd_data = load_json(tsd_json_path)

# Prepare Final List
final_list = []

# Process SS01 (Merge SS01b)
if ss01_data:
    ss01_block = ss01_data[0]
    if ss01b_data:
        ss01_faults = ss01_block['faults']
        ss01b_faults = ss01b_data[0]['faults']
        existing_codes = {f['faultCode'] for f in ss01_faults}
        for fault in ss01b_faults:
            if fault['faultCode'] not in existing_codes:
                ss01_faults.append(fault)
        ss01_block['faults'] = ss01_faults
    final_list.append(ss01_block)

# Process SS02
if ss02_data:
    final_list.append(ss02_data[0])

# Process SS03
if ss03_data:
    final_list.append(ss03_data[0])
elif ss02_data:
    # Fallback: Auto-generate SS03 from SS02 if SS03.json missing
    print("SS03.json not found, auto-generating from SS02...")
    ss02_faults = ss02_data[0]['faults']
    ss03_faults = []
    for fault in ss02_faults:
        new_fault = json.loads(json.dumps(fault))
        code = new_fault['faultCode']
        if code.startswith('F02'):
            new_fault['faultCode'] = 'F03' + code[3:]
        
        def replace_text(text):
            if isinstance(text, str):
                t = text.replace('Bogie 1', 'Bogie 2')
                t = t.replace('BOGIE 1', 'BOGIE 2')
                t = t.replace('bogie-1', 'bogie-2')
                t = t.replace('Bogie-1', 'Bogie-2')
                t = t.replace('बोगी-1', 'बोगी-2')
                t = t.replace('बोगी 1', 'बोगी 2')
                t = t.replace('Converter 1', 'Converter 2')
                t = t.replace('CONVERTER 1', 'CONVERTER 2')
                t = t.replace('कन्वर्टर-1', 'कन्वर्टर-2')
                t = t.replace('कनवर्टर 1', 'कनवर्टर 2')
                t = t.replace('SR-1', 'SR-2')
                t = t.replace('SB-1', 'SB-2')
                t = t.replace('SB1', 'SB2')
                t = t.replace('HB-1', 'HB-2')
                t = t.replace('127.1/1', '127.1/2')
                t = t.replace('127.11/1', '127.11/2')
                t = t.replace('59.1/1', '59.1/2')
                t = t.replace('63.1/1', '63.1/2')
                t = t.replace('OCB-1', 'OCB-2')
                t = t.replace('TMB-1', 'TMB-2')
                t = t.replace('BUR-1', 'BUR-2')
                t = t.replace("154 को '1'", "154 को '2'")
                t = t.replace("154 to '1'", "154 to '2'")
                t = t.replace("position '1'", "position '2'")
                t = t.replace("पोजीशन '1'", "पोजीशन '2'")
                t = t.replace('MOTOR-1', 'MOTOR-4')
                t = t.replace('MOTOR-2', 'MOTOR-5')
                t = t.replace('MOTOR-3', 'MOTOR-6')
                t = t.replace('TM-1', 'TM-4')
                t = t.replace('TM-2', 'TM-5')
                t = t.replace('TM-3', 'TM-6')
                return t
            elif isinstance(text, list):
                return [replace_text(item) for item in text]
            elif isinstance(text, dict):
                return {k: replace_text(v) for k, v in text.items()}
            return text

        new_fault['titleHI'] = replace_text(new_fault['titleHI'])
        new_fault['titleEN'] = replace_text(new_fault['titleEN'])
        new_fault['messageHI'] = replace_text(new_fault['messageHI'])
        new_fault['messageEN'] = replace_text(new_fault['messageEN'])
        new_fault['effectHI'] = replace_text(new_fault['effectHI'])
        new_fault['effectEN'] = replace_text(new_fault['effectEN'])
        new_fault['actionHI'] = replace_text(new_fault['actionHI'])
        new_fault['actionEN'] = replace_text(new_fault['actionEN'])
        new_fault['isolation'] = replace_text(new_fault['isolation'])
        ss03_faults.append(new_fault)

    final_list.append({
        "subsystemCode": "SS03",
        "subsystemNameHI": "ट्रैक्शन बोगी 2",
        "subsystemNameEN": "TRACTION BOGIE 2",
        "faults": ss03_faults
    })

# Process SS04
if ss04_data:
    final_list.append(ss04_data[0])

# Process SS05
if ss05_data:
    final_list.append(ss05_data[0])

# Process other subsystems from 3 phase fault tsd.json
if tsd_data:
    existing_subsystems = {item['subsystemCode'] for item in final_list}
    for subsystem in tsd_data:
        if subsystem['subsystemCode'] not in existing_subsystems:
             final_list.append(subsystem)

# Other subsystems placeholders (SS05-SS19)
subsystems_meta = [
    ("SS05", "होटल लोड", "HOTEL LOAD"),
    ("SS06", "ऑक्जिलरीज", "AUXILIARIES"),
    ("SS07", "बैटरी", "BATTERY"),
    ("SS08", "ब्रेक सिस्टम", "BRAKE SYSTEM"),
    ("SS09", "रेडियो रिमोट", "RADIO REMOTE"),
    ("SS10", "विजिलेंस", "VIGILANCE"),
    ("SS11", "लाइटिंग", "LIGHTING"),
    ("SS12", "कम्युनिकेशन", "COMMUNICATION"),
    ("SS13", "पैन्टोग्राफ", "PANTOGRAPH"),
    ("SS14", "फायर डिटेक्शन", "FIRE DETECTION"),
    ("SS15", "न्यूमेटिक", "PNEUMATIC"),
    ("SS16", "इलेक्ट्रॉनिक्स", "ELECTRONICS"),
    ("SS17", "डिस्प्ले", "DISPLAY"),
    ("SS18", "डायग्नोस्टिक्स", "DIAGNOSTICS"),
    ("SS19", "विविध", "MISCELLANEOUS")
]

existing_subsystems = {item['subsystemCode'] for item in final_list}

for code, name_hi, name_en in subsystems_meta:
    if code not in existing_subsystems:
        final_list.append({
            "subsystemCode": code,
            "subsystemNameHI": name_hi,
            "subsystemNameEN": name_en,
            "faults": [] # Placeholder
        })

# Write to JS file
js_content = f"""// 3-Phase Electric Locomotive Fault Database
// Integrated from TSD PDF and JSON files
// Auto-generated by generate_faults.py

const THREE_PHASE_LOCO_FAULTS = {json.dumps(final_list, indent=2, ensure_ascii=False)};
"""

with open(output_path, 'w', encoding='utf-8') as f:
    f.write(js_content)

print("Done writing to threePhaseLocoFaults.js")
