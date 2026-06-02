import axiosInstance from './axiosInstance';

export const cvApi = {
  /**
   * Uploads resume file (.pdf/.docx) to backend.
   * Costs 1 user credit, parses raw text with Gemini AI.
   * 
   * @param {File} file - Resume file object
   * @returns {Promise<Object>} CvUploadResponse { cvId, title, content, originalFileUrl, remainingCredits }
   */
  uploadCv: async (file) => {
    const formData = new FormData();
    formData.append('file', file);

    const { data } = await axiosInstance.post('/api/cv/upload', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });

    return data;
  },
};
