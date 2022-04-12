const config = require('config')
const axios = require('axios')

module.exports = async (keywords) => {
  try {
    const response = await axios.get(
      `${config.get('AV')}/query?${config.get('search')}${keywords}${config.get('apiKey')}`
    )
    return response.data.bestMatches[0]
  } catch (e) {
    console.log(e)
    return e.message
  }
}
