
import re

file_path = 'js/pages/profilePage.js'

def check_syntax(file_path):
    with open(file_path, 'r', encoding='utf-8') as f:
        content = f.read()
    
    stack = []
    lines = content.split('\n')
    
    for line_num, line in enumerate(lines, 1):
        # Remove comments
        line = re.sub(r'//.*', '', line)
        
        for char_idx, char in enumerate(line):
            if char in '{[(':
                stack.append((char, line_num, char_idx))
            elif char in '}])':
                if not stack:
                    print(f"Error: Unmatched closing '{char}' at line {line_num}:{char_idx}")
                    # Continue to find more errors or just exit
                    return False
                
                last_char, last_line, last_idx = stack.pop()
                expected = {'}': '{', ']': '[', ')': '('}[char]
                
                if last_char != expected:
                    print(f"Error: Mismatched closing '{char}' at line {line_num}:{char_idx}. Expected closing for '{last_char}' from line {last_line}:{last_idx}")
                    return False
                
                # Check if this closing brace closes the main object (assuming starts at line 2)
                if not stack:
                    print(f"Main object closed at line {line_num}:{char_idx}")
                    
    if stack:
        last_char, last_line, last_idx = stack[-1]
        print(f"Error: Unmatched opening '{last_char}' at line {last_line}:{last_idx}")
        return False
        
    print("Syntax check passed: Braces are balanced.")
    return True

check_syntax(file_path)
