import axios from 'axios';

const API_URL = 'https://apis.iflow.cn/v1/chat/completions';

export default async function chatCompletionHandler(req, res) {
  try {
    // 验证必要参数
    if (!req.headers.authorization) {
      return res
        .status(400)
        .json({ error: 'Authorization header is required' });
    }
    if (!req.body || !req.body.messages || !req.body.model) {
      return res
        .status(400)
        .json({ error: 'Request body must contain messages and model' });
    }

    const response = await axios.post(API_URL, req.body, {
      headers: {
        Authorization: req.headers.authorization,
        'Content-Type': 'application/json'
      },
      responseType: 'stream'
    });

    res.setHeader('Content-Type', 'text/event-stream');
    response.data.pipe(res);
  } catch (error) {
    let errorData = '';
    if (error.response?.data) {
      if (typeof error.response.data.pipe === 'function') {
        errorData = await new Promise((resolve) => {
          const chunks = [];
          error.response.data.on('data', (chunk) => chunks.push(chunk));
          error.response.data.on('end', () =>
            resolve(Buffer.concat(chunks).toString())
          );
          setTimeout(() => resolve('Error response timed out'), 5000);
        });
      } else {
        errorData = error.response.data;
      }
    }

    console.error('API request error details:', {
      message: error.message,
      code: error.code,
      stack: error.stack,
      config: error.config,
      status: error.response?.status,
      headers: error.response?.headers,
      data: errorData
    });

    res.status(error.response?.status || 500).json({
      error: 'Proxy server error',
      details: error.message,
      status: error.response?.status,
      apiResponse: errorData
    });
  }
}
