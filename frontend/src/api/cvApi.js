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

  /**
   * Fetches or triggers AI CV Analysis for a specific CV.
   * 
   * @param {string} cvId - The UUID of the CV
   * @returns {Promise<Object>} CvAnalysisResponse
   */
  getCvAnalysis: async (cvId) => {
    const { data } = await axiosInstance.get(`/api/cv-analysis/${cvId}`);
    return data;
  },

  /**
   * Fetches the parsed CV details by ID from database.
   * 
   * @param {string} id - The UUID of the CV
   * @returns {Promise<Object>} CvUploadResponse { cvId, title, content, originalFileUrl }
   */
  getCvById: async (id) => {
    const { data } = await axiosInstance.get(`/api/cv/${id}`);
    return data;
  },
  getUserCvs: async () => {
    const { data } = await axiosInstance.get('/api/cv')
    return data
  },
};
