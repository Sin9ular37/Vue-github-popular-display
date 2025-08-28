// simple proxy to add Authorization header if GITHUB_TOKEN present
const express = require('express')
const axios = require('axios')
const app = express()
const PORT = process.env.PORT || 5174

app.get('/github/*', async (req, res) => {
  try{
    const path = req.path.replace('/github','')
    const url = `https://api.github.com${path}`
    const qs = req.query
    const headers = { 'User-Agent': 'github-proxy' }
    if (process.env.GITHUB_TOKEN) headers['Authorization'] = `token ${process.env.GITHUB_TOKEN}`
    const resp = await axios.get(url, { params: qs, headers })
    res.status(resp.status).json(resp.data)
  }catch(e){
    res.status(500).json({ error: e.message })
  }
})

app.listen(PORT, ()=> console.log('proxy listening', PORT)) 