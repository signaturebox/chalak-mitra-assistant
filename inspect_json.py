import json
import os

path = r"C:\Users\USER\Desktop\nwr chalak\3phse loco\3 phase fault tsd.json"

try:
    with open(path, 'r', encoding='utf-8') as f:
        data = json.load(f)
        
    print(f"Total items: {len(data)}")
    for item in data:
        print(f"Subsystem: {item.get('subsystemCode', 'Unknown')} - {item.get('subsystemNameEN', 'Unknown')}")
        
except Exception as e:
    print(f"Error: {e}")
