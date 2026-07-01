import axiosInstance from "./axiosInstance";

export const atsApi = {
  scoreCv: async (cvData, jobDescription) => {
    const { data } = await axiosInstance.post("/api/ats/score", {
      cvData,
      jobDescription,
    });
    return data;
  },
};
