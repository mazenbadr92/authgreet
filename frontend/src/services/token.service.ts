import axiosInstace from "../axiosInstance";

const API_URL = "http://localhost:3000";

export const TokenService = {
  validateToken: async (token: string): Promise<void> => {
    // Call the validate endpoint; throws an error if the token is invalid.
    await axiosInstace.post(
      `${API_URL}/tokens/validate`,
      {}, // No body is needed.
      { headers: { Authorization: `Bearer ${token}` } }
    );
  },
};
