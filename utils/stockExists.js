import config from 'config'
import axios from 'axios'

export default async (keywords) => {
  try {
    const response = await axios.get(
      `${config.get('AV')}/query?${config.get('search')}${keywords}${config.get('apiKey')}`
    )
    if (response.data.bestMatches) {
      return response.data.bestMatches[0]
    } else throw response.data
  } catch (e) {
    throw e
  }
}
