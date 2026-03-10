const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

export async function uploadDocuments(files: File[]) {
  const formData = new FormData();
  files.forEach((file) => {
    formData.append("files", file);
  });

  const response = await fetch(`${API_BASE_URL}/upload-documents`, {
    method: "POST",
    body: formData,
  });

  if (!response.ok) {
    throw new Error("Failed to upload documents");
  }

  return response.json();
}

export async function runAnalysis(data: any) {
  const response = await fetch(`${API_BASE_URL}/run-analysis`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify(data)
  });

  if (!response.ok) {
    throw new Error("Failed to run analysis");
  }

  return response.json();
}

export async function getAnalysisStatus() {
  const response = await fetch(`${API_BASE_URL}/analysis-status`);
  if (!response.ok) {
    throw new Error("Failed to fetch analysis status");
  }
  return response.json();
}

export async function submitDueDiligence(notes: any) {
  const response = await fetch(`${API_BASE_URL}/due-diligence`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(notes),
  });

  if (!response.ok) {
    throw new Error("Failed to submit due diligence");
  }

  return response.json();
}

export async function generateCam(data: any, format: 'word' | 'pdf') {
  const response = await fetch(`${API_BASE_URL}/generate-cam?format=${format}`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify(data)
  });

  if (!response.ok) {
    throw new Error("Failed to generate CAM");
  }

  return response.blob();
}

export async function fetchDashboardData(userId: number = 1) {
  const response = await fetch(`${API_BASE_URL}/dashboard-data?user_id=${userId}`);
  if (!response.ok) {
    throw new Error("Failed to fetch dashboard data");
  }
  return response.json();
}

export async function processDocument(documentId: number, userId: number = 1) {
  const response = await fetch(`${API_BASE_URL}/process-document`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify({ document_id: documentId, user_id: userId })
  });

  if (!response.ok) {
    throw new Error("Failed to process document");
  }
  return response.json();
}

export async function getDocuments(userId: number = 1) {
  const response = await fetch(`${API_BASE_URL}/documents?user_id=${userId}`);
  if (!response.ok) {
    throw new Error("Failed to fetch documents");
  }
  return response.json();
}
