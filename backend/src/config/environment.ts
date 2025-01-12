export const config = {
  server: {
    port: process.env.PORT || 4000,
    nodeEnv: process.env.NODE_ENV || 'development'
  },
  database: {
    uri: process.env.MONGODB_URI || 'mongodb://localhost:27017/llm-hub'
  },
  cors: {
    origin: process.env.NODE_ENV === 'production' 
      ? ['https://llm-hub-jade.vercel.app', 'https://llm-hub-mtst.vercel.app']
      : 'http://localhost:3000'
  },
  llm: {
    CLAUDE_API_KEY: process.env.CLAUDE_API_KEY || ''
  }
};

export default config;