export const config = {
    server: {
      port: process.env.PORT || 4000,
      nodeEnv: process.env.NODE_ENV || 'development'
    },
    database: {
      uri: process.env.MONGODB_URI || 'mongodb://localhost:27017/llm-hub'
    },
    cors: {
      origin: process.env.FRONTEND_URL || 'http://localhost:3000'
    }
  };
  
  export default config;