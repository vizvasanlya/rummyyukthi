import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import AsyncStorage from "@react-native-async-storage/async-storage";
import axios from "../../api/apiConfig";

// Async thunk for login
export const loginUser = createAsyncThunk(
  "auth/loginUser",
  async ({ email, password }, { rejectWithValue }) => {
    try {
      const response = await axios.post("/auth/login", { email, password });
      const { user, token } = response.data;

      // Save token & user to AsyncStorage
      await AsyncStorage.setItem("userToken", token);
      await AsyncStorage.setItem("user", JSON.stringify(user));

      return { user, token };
    } catch (error) {
      const errorMessage = error.response?.data?.message || "Login failed";
      return rejectWithValue(errorMessage);
    }
  }
);

// Async thunk for registration
export const registerUser = createAsyncThunk(
  "auth/registerUser",
  async ({ username, email, password }, { rejectWithValue }) => {
    try {
      const response = await axios.post("/auth/register", {
        username,
        email,
        password,
      });

      const { user, token } = response.data;

      // Save new user session to AsyncStorage
      await AsyncStorage.setItem("userToken", token);
      await AsyncStorage.setItem("user", JSON.stringify(user));

      return { user, token };
    } catch (error) {
      const errorMessage = error.response?.data?.message || "Registration failed";
      return rejectWithValue(errorMessage);
    }
  }
);

// Async thunk to fetch wallet balance
export const fetchWalletBalance = createAsyncThunk(
  "auth/fetchWalletBalance",
  async (_, { getState, rejectWithValue }) => {
    try {
      const { user, token } = getState().auth;
      if (!user || !token) {
        throw new Error("User not logged in");
      }

      // Include userId in the API request
      const response = await axios.get(`/wallet/balance/${user.id}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      return response.data.balance; // Assuming the API returns { balance: number }
    } catch (error) {
      const errorMessage = error.response?.data?.message || "Failed to fetch balance";
      return rejectWithValue(errorMessage);
    }
  }
);

// Async thunk to load saved session
export const loadSession = createAsyncThunk("auth/loadSession", async () => {
  const token = await AsyncStorage.getItem("userToken");
  const user = await AsyncStorage.getItem("user");

  if (token && user) {
    return { user: JSON.parse(user), token };
  }
  return { user: null, token: null };
});

const authSlice = createSlice({
  name: "auth",
  initialState: {
    user: null,
    token: null,
    loading: false,
    error: null,
    balance: null, // Use null initially instead of 0 to signify balance is being fetched
  },
  reducers: {
    logout: (state) => {
      state.user = null;
      state.token = null;
      state.error = null;
      state.balance = null; // Reset to null upon logout

      // Clear AsyncStorage on logout
      AsyncStorage.removeItem("userToken");
      AsyncStorage.removeItem("user");
    },
  },
  extraReducers: (builder) => {
    builder
      // Load session on app start
      .addCase(loadSession.fulfilled, (state, action) => {
        state.user = action.payload.user;
        state.token = action.payload.token;
      })

      // Login cases
      .addCase(loginUser.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(loginUser.fulfilled, (state, action) => {
        state.loading = false;
        state.user = action.payload.user;
        state.token = action.payload.token;
      })
      .addCase(loginUser.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || "Login failed";
      })

      // Register cases
      .addCase(registerUser.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(registerUser.fulfilled, (state, action) => {
        state.loading = false;
        state.user = action.payload.user;
        state.token = action.payload.token;
      })
      .addCase(registerUser.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || "Registration failed";
      })

      // Fetch wallet balance cases
      .addCase(fetchWalletBalance.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchWalletBalance.fulfilled, (state, action) => {
        state.loading = false;
        state.balance = action.payload; // Update balance in the Redux state
      })
      .addCase(fetchWalletBalance.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || "Failed to fetch balance";
      });
  },
});

export const { logout } = authSlice.actions;
export default authSlice.reducer;
