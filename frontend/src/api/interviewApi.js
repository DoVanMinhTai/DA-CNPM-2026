import axios from './axiosInstance'

const generateQuestions = async ({ cvId, jobDescription }) => {
  const payload = { cvId, jobDescription }
  const { data } = await axios.post('/api/v1/interviews/generate-questions', payload)
  return data
}

const getInterviewsByCv = async (cvId) => {
  const { data } = await axios.get(`/api/v1/interviews/by-cv/${cvId}`)
  return data
}

const getInterviewById = async (id) => {
  const { data } = await axios.get(`/api/v1/interviews/${id}`)
  return data
}

export default { generateQuestions, getInterviewsByCv, getInterviewById }
