import React from "react";
import { render, screen, act, waitFor } from "@testing-library/react";
import { AuthProvider, useAuth } from "../context/AuthContext";
import { MemoryRouter } from "react-router-dom";
import { jwtDecode } from "jwt-decode";

jest.mock("axios");
jest.mock("jwt-decode");
jest.mock("../utils/axios", () => {
  return {
    __esModule: true,
    default: {
      interceptors: {
        request: {
          use: jest.fn(),
        },
        response: {
          use: jest.fn(),
        },
      },
      get: jest.fn(),
      post: jest.fn(),
      put: jest.fn(),
      delete: jest.fn(),
    },
  };
});
jest.mock("react-router-dom", () => ({
  ...jest.requireActual("react-router-dom"),
  useNavigate: () => jest.fn(),
}));

const TestComponent = () => {
  const auth = useAuth();
  return (
    <div>
      <div data-testid="loading">{auth.loading.toString()}</div>
      <div data-testid="authenticated">{auth.isAuthenticated.toString()}</div>
      {auth.user && (
        <>
          <div data-testid="username">{auth.user.userName}</div>
          <div data-testid="balance">{auth.user.walletBalance}</div>
          <button onClick={() => auth.logout()}>Logout</button>
          <button onClick={() => auth.updateWalletBalance(500)}>
            Update Balance
          </button>
          <button onClick={() => auth.updateXp(200)}>Update XP</button>
        </>
      )}
    </div>
  );
};

describe("AuthProvider", () => {
  beforeEach(() => {
    localStorage.clear();
    jest.clearAllMocks();
  });

  test("should finish loading and be unauthenticated when no token exists", async () => {
    render(
      <MemoryRouter>
        <AuthProvider>
          <TestComponent />
        </AuthProvider>
      </MemoryRouter>
    );

    await waitFor(() => {
      expect(screen.getByTestId("loading").textContent).toBe("false");
    });

    expect(screen.getByTestId("loading").textContent).toBe("false");
    expect(screen.getByTestId("authenticated").textContent).toBe("false");
    expect(screen.queryByTestId("username")).toBeNull();
  });

  test("should check for existing token on mount", async () => {
    const mockToken = "valid-token";
    localStorage.setItem("token", mockToken);

    jwtDecode.mockReturnValue({ exp: Date.now() / 1000 + 3600 });

    const mockUserData = {
      data: {
        user: {
          username: "testuser",
          xp: 1000,
          role: "user",
          wallet: {
            balance: 1000,
            dailyBonusClaimed: null,
          },
        },
      },
    };

    const mockAxiosInstance = {
      get: jest.fn().mockResolvedValue(mockUserData),
    };

    require("../utils/axios").default = mockAxiosInstance;

    await act(async () => {
      render(
        <MemoryRouter>
          <AuthProvider>
            <TestComponent />
          </AuthProvider>
        </MemoryRouter>
      );
    });

    await waitFor(() => {
      expect(screen.getByTestId("loading").textContent).toBe("false");
      expect(screen.getByTestId("authenticated").textContent).toBe("true");
      expect(screen.getByTestId("username").textContent).toBe("testuser");
      expect(screen.getByTestId("balance").textContent).toBe("1000");
    });
  });

  test("should update wallet balance correctly", async () => {
    const mockToken = "valid-token";
    localStorage.setItem("token", mockToken);

    jwtDecode.mockReturnValue({ exp: Date.now() / 1000 + 3600 });

    const mockUserData = {
      data: {
        user: {
          username: "testuser",
          xp: 1000,
          role: "user",
          wallet: {
            balance: 1000,
            dailyBonusClaimed: null,
          },
        },
      },
    };

    const mockAxiosInstance = {
      get: jest.fn().mockResolvedValue(mockUserData),
    };

    require("../utils/axios").default = mockAxiosInstance;

    await act(async () => {
      render(
        <MemoryRouter>
          <AuthProvider>
            <TestComponent />
          </AuthProvider>
        </MemoryRouter>
      );
    });

    await waitFor(() => {
      expect(screen.getByTestId("balance").textContent).toBe("1000");
    });

    await act(async () => {
      screen.getByText("Update Balance").click();
    });

    expect(screen.getByTestId("balance").textContent).toBe("500");
  });

  test("should handle login correctly", async () => {
    const mockToken = "new-login-token";

    const mockUserData = {
      data: {
        user: {
          username: "newuser",
          xp: 50,
          role: "user",
          wallet: {
            balance: 500,
            dailyBonusClaimed: null,
          },
        },
      },
    };

    const mockAxiosInstance = {
      get: jest.fn().mockResolvedValue(mockUserData),
    };

    require("../utils/axios").default = mockAxiosInstance;

    let loginFunction;

    function LoginTestComponent() {
      const auth = useAuth();
      loginFunction = auth.login;
      return <div data-testid="login-test">Login Test</div>;
    }

    await act(async () => {
      render(
        <MemoryRouter>
          <AuthProvider>
            <LoginTestComponent />
          </AuthProvider>
        </MemoryRouter>
      );
    });

    await act(async () => {
      await loginFunction(mockToken);
    });

    expect(localStorage.getItem("token")).toBe(mockToken);
    expect(mockAxiosInstance.get).toHaveBeenCalledWith("/data/userdata", {
      headers: {
        Authorization: `Bearer ${mockToken}`,
      },
    });
  });

  test("should handle expired token", async () => {
    const mockToken = "expired-token";
    localStorage.setItem("token", mockToken);

    jwtDecode.mockReturnValue({ exp: Date.now() / 1000 - 3600 });

    const mockNavigate = jest.fn();
    require("react-router-dom").useNavigate = () => mockNavigate;

    await act(async () => {
      render(
        <MemoryRouter>
          <AuthProvider>
            <TestComponent />
          </AuthProvider>
        </MemoryRouter>
      );
    });

    await act(async () => {
      localStorage.removeItem("token");
    });

    await waitFor(() => {
      expect(localStorage.getItem("token")).toBeNull();
      expect(screen.getByTestId("authenticated").textContent).toBe("false");
    });
  });
});
