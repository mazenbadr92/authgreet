import axiosInstace from "../axiosInstance";
import { useAuthStore } from "../stores/auth.store";

const API_URL = "http://localhost:3000";

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface LoginResponse {
  token: string;
  message: string;
}

class AuthService {
  async login(credentials: LoginCredentials): Promise<LoginResponse> {
    const response = await axiosInstace.post(
      `${API_URL}/authenticate/login`,
      credentials
    );
    useAuthStore.setState({ accessToken: response.data.accessToken });
    return response.data;
  }

  async signup(data: {
    email: string;
    name: string;
    password: string;
  }): Promise<LoginResponse> {
    const response = await axiosInstace.post(
      `${API_URL}/authenticate/signup`,
      data
    );
    return response.data;
  }
  async logout(): Promise<Response> {
    return await axiosInstace.post(`${API_URL}/authenticate/logout`, {});
  }
}

export default new AuthService();
