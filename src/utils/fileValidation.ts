/**
 * File Upload Validation Utility
 * Enforces file upload rules across the HOS platform
 */

export interface FileValidationResult {
  isValid: boolean;
  error?: string;
}

export interface ImageDimensions {
  width: number;
  height: number;
}

/**
 * AI Agent Image Validation Rules:
 * - Must be exactly 512x512 pixels
 * - Max file size: 250KB
 * - Must be an image file
 */
export const AGENT_IMAGE_RULES = {
  maxSize: 250 * 1024, // 250KB in bytes
  requiredWidth: 512,
  requiredHeight: 512,
  allowedTypes: ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'],
} as const;

/**
 * General File Upload Rules:
 * - Max file size: 1MB
 * - 1 file per project
 */
export const GENERAL_FILE_RULES = {
  maxSize: 1 * 1024 * 1024, // 1MB in bytes
  maxFilesPerProject: 1,
} as const;

/**
 * Get image dimensions from a File object
 */
export async function getImageDimensions(file: File): Promise<ImageDimensions> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    const url = URL.createObjectURL(file);
    
    img.onload = () => {
      URL.revokeObjectURL(url);
      resolve({
        width: img.width,
        height: img.height,
      });
    };
    
    img.onerror = () => {
      URL.revokeObjectURL(url);
      reject(new Error('Failed to load image'));
    };
    
    img.src = url;
  });
}

/**
 * Validate AI agent image upload
 * Returns validation result with error message if invalid
 */
export async function validateAgentImage(file: File): Promise<FileValidationResult> {
  // Check file type
  if (!AGENT_IMAGE_RULES.allowedTypes.includes(file.type)) {
    return {
      isValid: false,
      error: 'Please upload a valid image file (JPEG, PNG, or WebP)',
    };
  }

  // Check file size (250KB max)
  if (file.size > AGENT_IMAGE_RULES.maxSize) {
    const maxSizeKB = Math.round(AGENT_IMAGE_RULES.maxSize / 1024);
    const fileSizeKB = Math.round(file.size / 1024);
    return {
      isValid: false,
      error: `Image must be less than ${maxSizeKB}KB (current: ${fileSizeKB}KB)`,
    };
  }

  // Check dimensions (must be exactly 512x512)
  try {
    const dimensions = await getImageDimensions(file);
    
    if (
      dimensions.width !== AGENT_IMAGE_RULES.requiredWidth ||
      dimensions.height !== AGENT_IMAGE_RULES.requiredHeight
    ) {
      return {
        isValid: false,
        error: `Image must be exactly ${AGENT_IMAGE_RULES.requiredWidth}x${AGENT_IMAGE_RULES.requiredHeight} pixels (current: ${dimensions.width}x${dimensions.height})`,
      };
    }
  } catch (error) {
    return {
      isValid: false,
      error: 'Failed to read image dimensions',
    };
  }

  return { isValid: true };
}

/**
 * Validate general file upload
 * Returns validation result with error message if invalid
 */
export function validateGeneralFile(file: File): FileValidationResult {
  // Check file size (1MB max)
  if (file.size > GENERAL_FILE_RULES.maxSize) {
    const maxSizeMB = GENERAL_FILE_RULES.maxSize / (1024 * 1024);
    const fileSizeMB = (file.size / (1024 * 1024)).toFixed(2);
    return {
      isValid: false,
      error: `File must be less than ${maxSizeMB}MB (current: ${fileSizeMB}MB)`,
    };
  }

  return { isValid: true };
}

/**
 * Format file size for display
 */
export function formatFileSize(bytes: number): string {
  if (bytes < 1024) {
    return `${bytes} bytes`;
  } else if (bytes < 1024 * 1024) {
    return `${(bytes / 1024).toFixed(2)} KB`;
  } else {
    return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
  }
}
