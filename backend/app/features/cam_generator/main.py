import os
import sys
import json

from cam_generator.generator.cam_builder import build_cam
from cam_generator.export.word_exporter import generate_word_cam
from cam_generator.export.pdf_exporter import generate_pdf

def main(input_file):
    base_dir = os.path.dirname(os.path.abspath(__file__))
    input_path = os.path.join(base_dir, input_file)
    
    try:
        with open(input_path, 'r') as f:
            data = json.load(f)
            
        print("Synthesizing parameters...", file=sys.stderr)
        
        # 1. Structure text content
        sections = build_cam(data)
        
        # 2. Export Word document
        word_path = generate_word_cam(sections, output_dir=base_dir)
        print(f"Generated Word doc at: {word_path}")
        
        # 3. Export PDF document
        pdf_path = generate_pdf(sections, output_dir=base_dir)
        print(f"Generated PDF doc at: {pdf_path}")
        
    except Exception as e:
        print(f"Error publishing CAM: {str(e)}")

if __name__ == "__main__":
    base_dir = os.path.dirname(os.path.abspath(__file__))
    # Add project root to path for standalone testing
    root_dir = os.path.abspath(os.path.join(base_dir, ".."))
    if root_dir not in sys.path:
        sys.path.append(root_dir)
        
    target_file = "data/input.json"
    if len(sys.argv) > 1:
        target_file = sys.argv[1]
    main(target_file)
