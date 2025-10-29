// simple proxy to add Authorization header if GITHUB_TOKEN present
const express = require('express')
const axios = require('axios')
const crypto = require('crypto')

const app = express()
const PORT = process.env.PORT || 5174

app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*')
  res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept')
  res.header('Access-Control-Allow-Methods', 'GET,POST,OPTIONS')
  if (req.method === 'OPTIONS') {
    return res.sendStatus(204)
  }
  next()
})

app.use(express.json({ limit: '1mb' }))

app.get('/github/*', async (req, res) => {
  try {
    const path = req.path.replace('/github', '')
    const url = `https://api.github.com${path}`
    const qs = req.query
    const headers = { 'User-Agent': 'github-proxy' }
    if (process.env.GITHUB_TOKEN) {
      headers['Authorization'] = `token ${process.env.GITHUB_TOKEN}`
    }
    const resp = await axios.get(url, { params: qs, headers })
    res.status(resp.status).json(resp.data)
  } catch (e) {
    const status = e.response?.status || 500
    res.status(status).json({
      error: 'GitHub proxy request failed',
      detail: e.response?.data || e.message,
    })
  }
})

app.post('/translate', async (req, res) => {
  const { text, target = 'zh', from = 'auto' } = req.body || {}
  if (!text || typeof text !== 'string' || !text.trim()) {
    return res.status(400).json({ error: 'Missing text for translation' })
  }

  const appId = process.env.BAIDU_APP_ID
  const appKey = process.env.BAIDU_APP_KEY

  if (!appId || !appKey) {
    return res.status(500).json({
      error: 'Translation service is not configured. Please set BAIDU_APP_ID and BAIDU_APP_KEY.',
    })
  }

  try {
    const salt = Date.now().toString()
    const sign = crypto
      .createHash('md5')
      .update(appId + text + salt + appKey)
      .digest('hex')

    const params = new URLSearchParams({
      q: text,
      from,
      to: target,
      appid: appId,
      salt,
      sign,
    })

    const response = await axios.post(
      'https://fanyi-api.baidu.com/api/trans/vip/translate',
      params.toString(),
      {
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
      }
    )

    const result = response.data
    if (result && Array.isArray(result.trans_result) && result.trans_result[0]) {
      return res.json({
        translation: result.trans_result[0].dst,
        detected: result.from,
      })
    }

    return res.status(502).json({
      error: 'Unexpected response from translation service',
      detail: result,
    })
  } catch (error) {
    const status = error.response?.status || 500
    res.status(status).json({
      error: 'Translation request failed',
      detail: error.response?.data || error.message,
    })
  }
})

app.listen(PORT, () => console.log('proxy listening', PORT))
