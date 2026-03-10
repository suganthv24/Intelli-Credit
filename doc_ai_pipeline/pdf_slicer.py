"""
PDF Slicer Module
-----------------
Slices massive PDFs into small, rigid micro-batches (e.g., 5 pages each) 
to prevent 'Payload Too Large' errors when uploading to external OCR APIs.
"""

import os
import fitz  # PyMuPDF

PAGES_PER_BATCH = 5

def slice_document(file_path: str, output_dir: str) -> list[str]:
    """
    If the file is a PDF, slices it into tiny N-page PDFs.
    If it's an image, returns it unaltered.

    Parameters
    ----------
    file_path : str
        Path to the original uploaded document.
    output_dir : str
        Directory to save the temporary sliced PDF batches.

    Returns
    -------
    list[str]
        A list of file paths to the newly created micro-batches.
    """
    ext = os.path.splitext(file_path)[1].lower()
    
    # If it's an image, no slicing is needed. Return it as a batch of 1.
    if ext != ".pdf":
        return [file_path]

    print(f"[Slicer] Scanning PDF structure for '{os.path.basename(file_path)}' …")
    
    try:
        doc = fitz.open(file_path)
    except Exception as e:
        raise RuntimeError(f"Failed to open PDF for slicing: {e}")

    total_pages = len(doc)
    print(f"[Slicer] PDF contains {total_pages} pages.")

    # If the PDF is already tiny, don't waste time slicing it.
    if total_pages <= PAGES_PER_BATCH:
        doc.close()
        return [file_path]

    batch_paths = []
    base_name = os.path.splitext(os.path.basename(file_path))[0]

    # Slice the document into rigid contiguous blocks
    for start_page in range(0, total_pages, PAGES_PER_BATCH):
        end_page = min(start_page + PAGES_PER_BATCH - 1, total_pages - 1)
        
        # Create a new blank PDF
        batch_doc = fitz.open()
        # Insert the specific page range from the original doc into the new doc
        batch_doc.insert_pdf(doc, from_page=start_page, to_page=end_page)
        
        # Save it to the temp directory
        batch_filename = f"{base_name}_batch_{start_page + 1}_to_{end_page + 1}.pdf"
        batch_path = os.path.join(output_dir, batch_filename)
        
        batch_doc.save(batch_path)
        batch_doc.close()
        
        batch_paths.append(batch_path)
        print(f"[Slicer] Created micro-batch: {batch_filename} ({end_page - start_page + 1} pages)")

    doc.close()
    return batch_paths
