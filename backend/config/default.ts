import dotenv from 'dotenv';

// Chargement des variables d'environnement
dotenv.config();

interface Config {
  server: {
    port: number;
    nodeEnv: string;
  };
  database: {
    uri: string;
  };
  security: {
    jwtSecret: string;
    jwtExpiration: string;
  };
  cors: {
    origin: string;
  };
  llm: {
    claude: {
      apiKey: string;
      apiUrl: string;
    };
    chatgpt: {
      apiKey: string;
      apiUrl: string;
    };
    deepseek: {
      apiKey: string;
      apiUrl: string;
    };
    grok: {
      apiKey: string;
      apiUrl: string;
    };
  };
}

const config: Config = {
  server: {
    port: Number(process.env.PORT) || 4000,
    nodeEnv: process.env.NODE_ENV || 'development',
  },
  database: {
    uri: process.env.MONGODB_URI || 'mongodb://localhost:27017/llm-hub',
  },
  security: {
    jwtSecret: process.env.JWT_SECRET || 'votre-secret-jwt-super-securise',
    jwtExpiration: '7d',
  },
  cors: {
    origin: process.env.FRONTEND_URL || 'http://localhost:3000',
  },
  llm: {
    claude: {
      apiKey: process.env.CLAUDE_API_KEY || '',
      apiUrl: 'https://api.anthropic.com/v1',
    },
    chatgpt: {
      apiKey: process.env.CHATGPT_API_KEY || '',
      apiUrl: 'https://api.openai.com/v1',
    },
    deepseek: {
      apiKey: process.env.DEEPSEEK_API_KEY || '',
      apiUrl: 'https://api.deepseek.com/v1',
    },
    grok: {
      apiKey: process.env.GROK_API_KEY || '',
      apiUrl: 'https://api.grok.x.ai/v1',
    },
  },
};

export default config;