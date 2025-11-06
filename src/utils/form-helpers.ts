import { toast } from 'sonner@2.0.3';
import { createSubmission, uploadFile } from './api';

export interface FileUploadResult {
  url: string;
  path: string;
  fileName: string;
}

export async function submitRegistrationForm(
  formData: any,
  files: { [key: string]: File | null },
  category: string
): Promise<boolean> {
  try {
    // Validate required files
    const missingFiles = Object.entries(files)
      .filter(([_, file]) => file === null)
      .map(([key]) => key);

    if (missingFiles.length > 0) {
      toast.error('Please upload all required documents');
      return false;
    }

    // Create a temporary submission ID
    const tempId = Date.now().toString();

    // Upload all files
    toast.info('Uploading documents...');
    const fileEntries = Object.entries(files).filter(([_, file]) => file !== null);
    
    const uploadPromises = fileEntries.map(async ([key, file]) => {
      if (!file) return null;
      const result = await uploadFile(file, category, tempId);
      return { key, result };
    });

    const uploadResults = await Promise.all(uploadPromises);

    // Build file data for submission
    const fileData: any = {};
    uploadResults.forEach(item => {
      if (item) {
        fileData[item.key] = item.result.url;
        fileData[`${item.key}Path`] = item.result.path;
      }
    });

    // Create submission
    const submissionData = {
      ...formData,
      ...fileData,
      category,
    };

    toast.info('Submitting application...');
    await createSubmission(submissionData);

    toast.success('Application submitted successfully!');
    return true;
  } catch (error: any) {
    console.error('Submission error:', error);
    toast.error(error.message || 'Failed to submit application. Please try again.');
    return false;
  }
}
