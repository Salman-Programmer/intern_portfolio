import { createAuthClient } from "better-auth/react";

export const authClient = createAuthClient({
  // Completely removing baseURL forces the client to use relative paths.
  // Now, preview branches talk to preview backends, and production talks to production!
});

export const { signIn, signUp, signOut, useSession, getSession } = authClient;