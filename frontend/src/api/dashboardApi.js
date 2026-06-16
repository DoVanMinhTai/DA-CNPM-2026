import axios from './axiosInstance'

const getStatistics = async () => {
  const { data } = await axios.get('/api/v1/dashboard/statistics')
  return data
}

export default { getStatistics }
