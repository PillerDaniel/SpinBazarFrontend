import React from "react";
import { render, screen, act, waitFor } from "@testing-library/react";
import { AuthProvider, useAuth } from "../context/AuthContext";
import axiosInstance from "../utils/axios";
import { jwtDecode } from "jwt-decode";
import { useNavigate } from "react-router-dom";

jest.mock("react-router-dom", () => ({
  useNavigate: jest.fn()
}));

jest.mock("jwt-decode", () => ({
  jwtDecode: jest.fn()
}));

jest.mock("../utils/axios", () => {
  const mockRequestInterceptor = { use: jest.fn(), eject: jest.fn() };
  const mockResponseInterceptor = { use: jest.fn(), eject: jest.fn() };
  
  return {
    interceptors: {
      request: mockRequestInterceptor,
      response: mockResponseInterceptor
    },
    get: jest.fn(),
    post: jest.fn()
  }
});

const AuthTestComponent = () => {
  const auth = useAuth();
  return (
    <div>
      <div data-testid="loading">{auth.loading.toString()}</div>
      <div data-testid="authenticated">{auth.isAuthenticated.toString()}</div>
      {auth.user && (
        <>
          <div data-testid="username">{auth.user.userName}</div>
          <div data-testid="xp">{auth.user.xp}</div>
          <div data-testid="balance">{auth.user.walletBalance}</div>
        </>
      )}
      <button data-testid="login-btn" onClick={() => auth.login("test-token")}>
        Login
      </button>
      <button data-testid="logout-btn" onClick={() => auth.logout()}>
        Logout
      </button>
      <button data-testid="update-balance" onClick={() => auth.updateWalletBalance(1000)}>
        Update Balance
      </button>
      <button data-testid="update-xp" onClick={() => auth.updateXp(500)}>
        Update XP
      </button>
    </div>
  );
};

describe("AuthContext", () => {
  const mockNavigate = jest.fn();
  let successCallback, errorCallback;
  
  beforeEach(() => {
    jest.clearAllMocks();
    localStorage.clear();
    useNavigate.mockReturnValue(mockNavigate);
    
    axiosInstance.interceptors.response.use.mockImplementation((success, error) => {
      successCallback = success;
      errorCallback = error;
      return 2;
    });
  });

  test("Should initialize with no user and not authenticated", async () => {
    render(
      <AuthProvider>
        <AuthTestComponent />
      </AuthProvider>
    );

    await waitFor(() => {
      expect(screen.getByTestId("loading").textContent).toBe("false");
      expect(screen.getByTestId("authenticated").textContent).toBe("false");
    });
  });

  test("Should handle successful login", async () => {
    const mockUserData = {
      data: {
        user: {
          username: "testuser",
          xp: 100,
          role: "user",
          wallet: {
            balance: 500,
            dailyBonusClaimed: "2023-01-01"
          }
        }
      }
    };

    axiosInstance.get.mockResolvedValueOnce(mockUserData);

    render(
      <AuthProvider>
        <AuthTestComponent />
      </AuthProvider>
    );

    await waitFor(() => {
      expect(screen.getByTestId("loading").textContent).toBe("false");
    });

    await act(async () => {
      screen.getByTestId("login-btn").click();
    });

    await waitFor(() => {
      expect(screen.getByTestId("loading").textContent).toBe("false");
      expect(screen.getByTestId("authenticated").textContent).toBe("true");
      expect(screen.getByTestId("username").textContent).toBe("testuser");
      expect(screen.getByTestId("xp").textContent).toBe("100");
      expect(screen.getByTestId("balance").textContent).toBe("500");
    });

    expect(localStorage.getItem("token")).toBe("test-token");
  });

  test("Should handle logout", async () => {
    const mockUserData = {
      data: {
        user: {
          username: "testuser",
          xp: 100,
          role: "user",
          wallet: {
            balance: 500,
            dailyBonusClaimed: "2023-01-01"
          }
        }
      }
    };

    axiosInstance.get.mockResolvedValueOnce(mockUserData);
    axiosInstance.post.mockResolvedValueOnce({});

    render(
      <AuthProvider>
        <AuthTestComponent />
      </AuthProvider>
    );

    await act(async () => {
      screen.getByTestId("login-btn").click();
    });

    await waitFor(() => {
      expect(screen.getByTestId("authenticated").textContent).toBe("true");
    });

    await act(async () => {
      screen.getByTestId("logout-btn").click();
    });

    await waitFor(() => {
      expect(screen.getByTestId("authenticated").textContent).toBe("false");
      expect(localStorage.getItem("token")).toBeNull();
    });

    expect(axiosInstance.post).toHaveBeenCalledWith("/auth/logout");
    expect(mockNavigate).toHaveBeenCalledWith("/login");
  });

  test("Should check token on initial load", async () => {
    const mockToken = "valid-token";
    localStorage.setItem("token", mockToken);
    
    jwtDecode.mockReturnValueOnce({ exp: (Date.now() / 1000) + 3600 });
    
    const mockUserData = {
      data: {
        user: {
          username: "testuser",
          xp: 100,
          role: "user",
          wallet: {
            balance: 500,
            dailyBonusClaimed: "2023-01-01"
          }
        }
      }
    };
    
    axiosInstance.get.mockResolvedValueOnce(mockUserData);

    render(
      <AuthProvider>
        <AuthTestComponent />
      </AuthProvider>
    );

    await waitFor(() => {
      expect(screen.getByTestId("authenticated").textContent).toBe("true");
      expect(screen.getByTestId("username").textContent).toBe("testuser");
    });
  });

  test("Should refresh token when expired", async () => {
    const mockToken = "expired-token";
    const mockNewToken = "new-refreshed-token";
    localStorage.setItem("token", mockToken);
    
    jwtDecode.mockReturnValueOnce({ exp: (Date.now() / 1000) - 3600 });
    
    axiosInstance.post.mockResolvedValueOnce({ 
      status: 200,
      data: { token: mockNewToken } 
    });
    
    const mockUserData = {
      data: {
        user: {
          username: "testuser",
          xp: 100,
          role: "user",
          wallet: {
            balance: 500,
            dailyBonusClaimed: "2023-01-01"
          }
        }
      }
    };
    
    axiosInstance.get.mockResolvedValueOnce(mockUserData);

    render(
      <AuthProvider>
        <AuthTestComponent />
      </AuthProvider>
    );

    await waitFor(() => {
      expect(axiosInstance.post).toHaveBeenCalledWith("/auth/refresh", { token: mockToken });
      expect(localStorage.getItem("token")).toBe(mockNewToken);
      expect(screen.getByTestId("authenticated").textContent).toBe("true");
    });
  });

  test("Should handle update wallet balance", async () => {
    const mockUserData = {
      data: {
        user: {
          username: "testuser",
          xp: 100,
          role: "user",
          wallet: {
            balance: 500,
            dailyBonusClaimed: "2023-01-01"
          }
        }
      }
    };

    axiosInstance.get.mockResolvedValueOnce(mockUserData);

    render(
      <AuthProvider>
        <AuthTestComponent />
      </AuthProvider>
    );

    await act(async () => {
      screen.getByTestId("login-btn").click();
    });

    await waitFor(() => {
      expect(screen.getByTestId("balance").textContent).toBe("500");
    });

    await act(async () => {
      screen.getByTestId("update-balance").click();
    });

    await waitFor(() => {
      expect(screen.getByTestId("balance").textContent).toBe("1000");
    });
  });

  test("Should handle update XP", async () => {
    const mockUserData = {
      data: {
        user: {
          username: "testuser",
          xp: 100,
          role: "user",
          wallet: {
            balance: 500,
            dailyBonusClaimed: "2023-01-01"
          }
        }
      }
    };

    axiosInstance.get.mockResolvedValueOnce(mockUserData);

    render(
      <AuthProvider>
        <AuthTestComponent />
      </AuthProvider>
    );

    await act(async () => {
      screen.getByTestId("login-btn").click();
    });

    await waitFor(() => {
      expect(screen.getByTestId("xp").textContent).toBe("100");
    });

    await act(async () => {
      screen.getByTestId("update-xp").click();
    });

    await waitFor(() => {
      expect(screen.getByTestId("xp").textContent).toBe("500");
    });
  });

  test("Should handle 401 response with interceptor", async () => {
    render(
      <AuthProvider>
        <AuthTestComponent />
      </AuthProvider>
    );
    
    await waitFor(() => {
      expect(axiosInstance.interceptors.response.use).toHaveBeenCalled();
    });
    
    if (!errorCallback) {
      fail("Response interceptor error callback was not set");
    }
    
    localStorage.setItem("token", "some-token");

    await act(async () => {
      try {
        await errorCallback({ 
          response: { status: 401 } 
        });
      } catch (error) {
      }
    });

    expect(localStorage.getItem("token")).toBeNull();
    expect(mockNavigate).toHaveBeenCalledWith("/login");
  });
});