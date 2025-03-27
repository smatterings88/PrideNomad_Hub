// Types
interface GHLConfig {
  apiKey: string;
  locationId: string;
  apiUrl: string;
}

interface GHLErrorResponse {
  status: string;
  message: string;
  code?: string;
}

interface GHLSuccessResponse {
  status: string;
  url: string;
}

// Constants
const GHL_CONFIG: GHLConfig = {
  apiKey: import.meta.env.VITE_GHL_API_KEY,
  locationId: import.meta.env.VITE_GHL_LOCATION_ID,
  apiUrl: 'https://api.gohighlevel.com/v1'  // Updated API URL
};

const FILE_CONSTRAINTS = {
  maxSize: 10 * 1024 * 1024, // 10MB in bytes
  allowedTypes: ['image/jpeg', 'image/png', 'image/gif', 'image/webp'] as const
};

// Validation functions
function validateConfig({ apiKey, locationId }: GHLConfig): void {
  if (!apiKey || apiKey === 'your_ghl_api_key_here') {
    throw new Error('Invalid GHL API key. Please set VITE_GHL_API_KEY in your environment variables.');
  }

  if (!locationId || locationId === 'your_ghl_location_id_here') {
    throw new Error('Invalid GHL Location ID. Please set VITE_GHL_LOCATION_ID in your environment variables.');
  }
}

function validateFile(file: File): void {
  if (!file) {
    throw new Error('No file provided');
  }

  if (file.size > FILE_CONSTRAINTS.maxSize) {
    throw new Error('File size exceeds 10MB limit');
  }

  if (!FILE_CONSTRAINTS.allowedTypes.includes(file.type as typeof FILE_CONSTRAINTS.allowedTypes[number])) {
    throw new Error('Invalid file type. Please upload a JPG, PNG, GIF, or WebP image.');
  }
}

// Main upload function
export async function uploadFileToGHL(file: File): Promise<string> {
  try {
    validateConfig(GHL_CONFIG);
    validateFile(file);

    const formData = new FormData();
    formData.append('file', file);

    // Updated endpoint URL and headers
    const response = await fetch(`${GHL_CONFIG.apiUrl}/files/`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${GHL_CONFIG.apiKey}`,
        'Accept': 'application/json'
      },
      body: formData,
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => null) as GHLErrorResponse | null;
      throw new Error(
        errorData?.message || 
        `Upload failed with status ${response.status}: ${response.statusText}`
      );
    }

    const data = await response.json() as GHLSuccessResponse;

    if (!data.url || typeof data.url !== 'string') {
      throw new Error('Invalid response format: missing url');
    }

    return data.url;
  } catch (error) {
    console.error('Error uploading file to GHL:', {
      error,
      errorMessage: error instanceof Error ? error.message : 'Unknown error',
      errorStack: error instanceof Error ? error.stack : undefined,
      file: {
        name: file.name,
        type: file.type,
        size: file.size
      },
      request: {
        url: `${GHL_CONFIG.apiUrl}/files/`,
        apiKey: GHL_CONFIG.apiKey ? 'Present' : 'Missing',
        locationId: GHL_CONFIG.locationId ? 'Present' : 'Missing'
      }
    });

    throw new Error(error instanceof Error ? error.message : 'Failed to upload file');
  }
}