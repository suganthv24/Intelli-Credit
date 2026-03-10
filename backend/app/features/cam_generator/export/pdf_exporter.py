import os
from reportlab.lib.pagesizes import letter
from reportlab.pdfgen import canvas
from reportlab.lib.utils import simpleSplit

def generate_pdf(sections, output_dir="."):
    """
    Given a dictionary of sections, generates a formatted PDF report.
    """
    output_path = os.path.join(output_dir, "CAM_Report.pdf")
    c = canvas.Canvas(output_path, pagesize=letter)
    width, height = letter
    
    c.setFont("Helvetica-Bold", 16)
    c.drawString(50, height - 50, "CREDIT APPRAISAL MEMO")
    
    y = height - 80
    
    for title, content in sections.items():
        # Title heading
        c.setFont("Helvetica-Bold", 12)
        if y < 100:
            c.showPage()
            y = height - 50
            
        c.drawString(50, y, title)
        y -= 20
        
        # Body text
        c.setFont("Helvetica", 10)
        lines = content.split('\n')
        for idx, line in enumerate(lines):
            # Text wrapping handling for long lines
            wrapped_lines = simpleSplit(line, "Helvetica", 10, width - 100)
            for wrapped in wrapped_lines:
                if y < 50:
                    c.showPage()
                    c.setFont("Helvetica", 10)
                    y = height - 50
                c.drawString(50, y, wrapped)
                y -= 15
        
        y -= 15 # Padding between sections
        
    c.save()
    return output_path
