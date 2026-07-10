import { betterAuth } from "better-auth";
import { mongodbAdapter } from "better-auth/adapters/mongodb";
import { MongoClient } from "mongodb";

const client = new MongoClient(
  process.env.MONGODB_URI || "mongodb://localhost:27017/portfolio_cms"
);

export const auth = betterAuth({
  database: mongodbAdapter(client.db()),
  
  // Fixes the CORS mismatch by automatically allowlisting Vercel domains
  baseURL: {
    allowedHosts: [
      "localhost:3000",
      "intern-portfolio.vercel.app",
      "*.vercel.app" // Accepts all preview and branch deployments safely
    ],
  },

  emailAndPassword: {
    enabled: true,
    requireEmailVerification: false,
  },
  session: {
    expiresIn: 60 * 60 * 24 * 7, // 7 days
    updateAge: 60 * 60 * 24,       // refresh if older than 1 day
  },
  user: {
    additionalFields: {
      username: {
        type: "string",
        required: false,
      },
    },
  },
});

export type Session = typeof auth.$Infer.Session;