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

  /**
   * Updates the CV PDF file and/or structured JSON content by ID.
   * 
   * @param {string} id - The UUID of the CV
   * @param {File} [file] - Updated PDF file
   * @param {string} [contentJson] - Serialized CV content JSON string
   * @returns {Promise<Object>} CvUploadResponse
   */
  updateCv: async (id, file, contentJson) => {
    const formData = new FormData();
    if (file) {
      formData.append("file", file);
    }
    if (contentJson) {
      formData.append("content", contentJson);
    }

    const { data } = await axiosInstance.put(`/api/cv/${id}`, formData, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    });
    return data;
  },

  /**
   * Updates the CV's structured JSON content by ID without touching the PDF.
   * 
   * @param {string} id - The UUID of the CV
   * @param {string} [contentJson] - Serialized CV content JSON string
   * @returns {Promise<Object>} CvUploadResponse
   */
  updateCvContent: async (id, contentJson) => {
    const params = new URLSearchParams();
    if (contentJson) {
      params.append("content", contentJson);
    }

    const { data } = await axiosInstance.put(`/api/cv/${id}/content`, params);
    return data;
  },

  /**
   * Saves the edited CV as a new version (creates a new CV draft).
   * 
   * @param {string} id - The parent CV ID
   * @param {File} file - Compiled PDF file
   * @param {string} [contentJson] - Serialized JSON content string
   * @returns {Promise<Object>} CvUploadResponse
   */
  saveCvVersion: async (id, file, contentJson) => {
    const formData = new FormData();
    formData.append("file", file);
    if (contentJson) {
      formData.append("content", contentJson);
    }

    const { data } = await axiosInstance.post(`/api/cv/${id}/version`, formData, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    });
    return data;
  },
};
