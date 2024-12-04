import { TOKEN_PROGRAM_ID } from "@solana/spl-token";
import {
  clusterApiUrl,
  Connection,
  LAMPORTS_PER_SOL,
  PublicKey,
} from "@solana/web3.js";
import "bootstrap-icons/font/bootstrap-icons.css";
import "bootstrap/dist/css/bootstrap.min.css";
import React, { useCallback, useEffect, useMemo, useState } from "react";
import HomeOutlinedIcon from "@mui/icons-material/HomeOutlined";
import {
  Navigate,
  NavLink,
  Route,
  BrowserRouter as Router,
  Routes,
} from "react-router-dom";
import logo from "./assert/sol.png";
import Authentication from "./pages/Authentication";
import Home from "./pages/Home"
import MyNfts from "./pages/MyNfts";
import Maket from './pages/Maket';
import User from "./components/User";
import Map from "./pages/Map";
import AccountBalanceWalletOutlinedIcon from "@mui/icons-material/AccountBalanceWalletOutlined";
import {
  Avatar,
  Box,
  IconButton,
  Typography,
  Button,
  Divider,
  MenuItem,
  Menu,
} from "@mui/joy";

// Địa chỉ token USDC chính thức trên Solana devnet
const USDC_MINT_ADDRESS = new PublicKey(
  "4zMMC9srt5Ri5X14GAgXhaHii3GnPAEERYPJgZJDncDU"
);

function App() {
  const isPhantomInstalled = window.phantom?.solana?.isPhantom;
  const [userData, setUserData] = useState(null);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);

  const [anchorEl, setAnchorEl] = useState(null);

  const handleMouseEnter = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleMouseLeave = () => {
    setAnchorEl(null);
  };

  // Theme state
  const [theme, setTheme] = useState(() => {
    const savedTheme = localStorage.getItem("app-theme");
    if (savedTheme) return savedTheme;

    return window.matchMedia("(prefers-color-scheme: dark)").matches
      ? "dark"
      : "light";
  });

  // Solana connection using useMemo inside the component
  const connection = useMemo(
    () => new Connection(clusterApiUrl("devnet"), "confirmed"),
    []
  );

  // Wallet state
  const [walletAddress, setWalletAddress] = useState(null);
  const [walletBalance, setWalletBalance] = useState(0);
  const [usdcBalance, setUsdcBalance] = useState(null);
  const [walletLoading, setWalletLoading] = useState(false);
  const [walletError, setWalletError] = useState(null);

  // Hàm lấy số dư USDC
  const getUsdcBalance = async (connection, walletPublicKey) => {
    try {
      // Chuyển đổi PublicKey nếu cần
      const publicKey =
        typeof walletPublicKey === "string"
          ? new PublicKey(walletPublicKey)
          : walletPublicKey;

      const tokenAccounts = await connection.getParsedTokenAccountsByOwner(
        publicKey,
        { programId: TOKEN_PROGRAM_ID }
      );

      const usdcAccount = tokenAccounts.value.find(
        (account) =>
          account.account.data.parsed.info.mint === USDC_MINT_ADDRESS.toBase58()
      );

      if (usdcAccount) {
        const usdcBalance =
          usdcAccount.account.data.parsed.info.tokenAmount.uiAmount;
        return usdcBalance || 0;
      }

      return 0; // Không tìm thấy tài khoản USDC
    } catch (error) {
      console.error("Lỗi khi lấy số dư USDC:", error);
      return 0;
    }
  };
  // Hàm fetch số dư USDC
  const fetchUsdcBalance = useCallback(async () => {
    if (walletAddress) {
      try {
        const balance = await getUsdcBalance(connection, walletAddress);
        setUsdcBalance(balance);
      } catch (error) {
        console.error("Lỗi khi lấy số dư USDC:", error);
        setUsdcBalance(0);
      }
    }
  }, [walletAddress, connection]);

  // Theo dõi theme và áp dụng class
  useEffect(() => {
    document.body.classList.remove("light-theme", "dark-theme");
    document.body.classList.add(`${theme}-theme`);
  }, [theme]);

  useEffect(() => {
    if (walletAddress) {
      fetchUsdcBalance();
    }
  }, [walletAddress, fetchUsdcBalance]);

  // Hàm thay đổi theme
  const toggleTheme = () => {
    const newTheme = theme === "light" ? "dark" : "light";
    setTheme(newTheme);
    localStorage.setItem("app-theme", newTheme);
  };

  useEffect(() => {
    const handleResize = () => {
      const width = window.innerWidth;
      setIsMobile(width < 768);
      if (width >= 768) {
        setIsSidebarOpen(true);
      } else {
        setIsSidebarOpen(false);
      }
    };

    handleResize(); // Initial check
    window.addEventListener("resize", handleResize);

    // Phantom Wallet connection status listeners
    const provider = window.phantom?.solana;

    if (provider) {
      const handleConnect = async (publicKey) => {
        console.log("Connected to wallet:", publicKey.toBase58());
        await fetchUsdcBalance();
      };

      const handleDisconnect = () => {
        console.log("Disconnected from wallet");
        setWalletAddress(null);
        setWalletBalance(0);
        setUsdcBalance(null);
      };

      provider.on("connect", handleConnect);
      provider.on("disconnect", handleDisconnect);

      // Cleanup listeners and resize event
      return () => {
        window.removeEventListener("resize", handleResize);
        provider.removeListener("connect", handleConnect);
        provider.removeListener("disconnect", handleDisconnect);
      };
    }

    return () => window.removeEventListener("resize", handleResize);
  }, [fetchUsdcBalance]);

  const toggleSidebar = () => {
    setIsSidebarOpen(!isSidebarOpen);
  };

  const closeSidebarOnMobile = () => {
    if (isMobile) {
      setIsSidebarOpen(false);
    }
  };

  const connectWallet = async () => {
    setWalletLoading(true);
    setWalletError(null);
    try {
      const provider = window.phantom?.solana;

      if (!provider?.isPhantom) {
        throw new Error("Vui lòng cài đặt Phantom Wallet!");
      }

      // Ensure any existing connection is properly closed
      if (provider.isConnected) {
        await provider.disconnect();
      }

      // Connect with explicit permission
      await provider.connect({ onlyIfTrusted: false });

      const publicKey = provider.publicKey;
      if (!publicKey) {
        throw new Error("Không thể lấy địa chỉ ví. Vui lòng thử lại.");
      }

      setWalletAddress(publicKey.toString());

      // Lấy số dư SOL
      await getWalletBalance(publicKey);

      // Lấy số dư USDC
      await fetchUsdcBalance();
    } catch (err) {
      console.error("Lỗi khi kết nối ví:", err);

      // More specific error handling
      if (err.code === 4001) {
        // User rejected the request
        setWalletError("Kết nối ví bị từ chối. Vui lòng thử lại.");
      } else {
        setWalletError(
          err.message || "Không thể kết nối ví. Vui lòng thử lại."
        );
      }
    } finally {
      setWalletLoading(false);
    }
  };

  const getWalletBalance = async (publicKey) => {
    try {
      const balance = await connection.getBalance(publicKey);
      setWalletBalance(balance / LAMPORTS_PER_SOL);
    } catch (err) {
      console.error("Lỗi khi lấy số dư:", err);
      setWalletError("Không thể lấy số dư ví. Vui lòng thử lại.");
    }
  };

  const disconnectWallet = async () => {
    try {
      const provider = window.phantom?.solana;
      if (provider) {
        await provider.disconnect();
        setWalletAddress(null);
        setWalletBalance(0);
        setUsdcBalance(null);
      }
    } catch (err) {
      console.error("Lỗi khi ngắt kết nối ví:", err);
      setWalletError("Không thể ngắt kết nối ví. Vui lòng thử lại.");
    }
  };

  const handleLogout = () => {
    setIsLoggedIn(false);
    setUserData(null);
    disconnectWallet();
  };

  return (
    <Router>
      <div className={`app-container ${theme}-theme`}>
        {!isLoggedIn ? (
          <div className="auth-container">
            <Authentication
              setIsLoggedIn={setIsLoggedIn}
              setUserData={setUserData}
            />
          </div>
        ) : (
          <div className="dashboard-container">
            {/* Overlay for mobile */}
            {isMobile && isSidebarOpen && (
              <div className="sidebar-overlay" onClick={toggleSidebar}></div>
            )}

            {/* Sidebar */}
            <div className={`sidebar ${!isSidebarOpen ? "closed" : ""}`}>
              <div className="sidebar-header">
                <Box
                  sx={{
                    display: "flex",
                    justifyContent: "start",
                    alignItems: "center",
                  }}
                >
                  <Avatar alt="Logo UDPM 9" src={logo} />
                  <Typography
                    sx={{ color: "#fff", marginLeft: 1 }}
                    level="title-lg"
                    variant="plain"
                  >
                    SOLANA UDPM 9
                  </Typography>
                </Box>
                {isMobile && (
                  <button
                    className="btn btn-link close-sidebar"
                    onClick={toggleSidebar}
                  >
                    <i className="bi bi-x-lg text-white"></i>
                  </button>
                )}
              </div>

              <div className="sidebar-content">
                <div className="nav flex-column">
                  <NavLink
                    to="/home"
                    className={({ isActive }) =>
                      `nav-link ${isActive ? "active" : ""}`
                    }
                    onClick={closeSidebarOnMobile}
                  >
                    <HomeOutlinedIcon />
                    Trang chủ
                  </NavLink>
                  <NavLink
                    to="/my-nfts"
                    className={({ isActive }) =>
                      `nav-link ${isActive ? "active" : ""}`
                    }
                    onClick={closeSidebarOnMobile}
                  >
                    <i className="bi bi-collection me-2"></i>
                    NFT của tôi
                  </NavLink>
                  <NavLink
                    to="/exchange-rate"
                    className={({ isActive }) =>
                      `nav-link ${isActive ? "active" : ""}`
                    }
                    onClick={closeSidebarOnMobile}
                  >
                    <i class="bi bi-coin me-2"></i>
                    Đồng sol và usdc
                  </NavLink>
                  <NavLink
                    to="/map"
                    className={({ isActive }) =>
                      `nav-link ${isActive ? "active" : ""}`
                    }
                    onClick={closeSidebarOnMobile}
                  >
                   <i class="bi bi-map me-2"></i>
                    Map
                  </NavLink>
                </div>
              </div>

              <div className="sidebar-footer">
                <div
                  className={`wallet-status ${
                    isPhantomInstalled ? "text-success" : "text-warning"
                  }`}
                >
                  <i className={`bi bi-circle-fill me-2`}></i>
                  <span className="text-white">
                    {isPhantomInstalled
                      ? "Phantom đã cài đặt"
                      : "Phantom chưa cài đặt"}
                  </span>
                </div>
              </div>
            </div>

            {/* Main Content */}
            <div className={`main-content ${!isSidebarOpen ? "expanded" : ""}`}>
              {/* Top Navigation */}
              <nav>
                <Box
                  display="flex"
                  alignItems="center"
                  width="100%"
                  sx={{ padding: "0 16px" }}
                >
                  {/* Sidebar Toggle Button */}
                  <IconButton
                    onClick={toggleSidebar}
                    sx={{ color: "text.primary" }}
                  >
                    <i className="bi bi-list fs-4"></i>
                  </IconButton>

                  {/* Theme Toggle Button */}
                  <IconButton
                    onClick={toggleTheme}
                    sx={{ marginLeft: "auto", color: "text.primary" }}
                    title="Chuyển chế độ giao diện"
                  >
                    {theme === "light" ? (
                      <i className="bi bi-moon-stars text-dark"></i>
                    ) : (
                      <i className="bi bi-brightness-high text-warning"></i>
                    )}
                  </IconButton>

                  {/* Wallet Display */}
                  <Box ml={2} display="flex" alignItems="center">
                    {!walletAddress ? (
                      <Button
                        startDecorator={<AccountBalanceWalletOutlinedIcon />}
                        variant="plain"
                        size="sm"
                        color="neutral"
                        onClick={connectWallet}
                        disabled={walletLoading}
                      >
                        {walletLoading ? (
                          <>
                            <span
                              className="spinner-border spinner-border-sm me-2"
                              role="status"
                              aria-hidden="true"
                            ></span>
                            Đang kết nối...
                          </>
                        ) : (
                          "Kết Nối Phantom"
                        )}
                      </Button>
                    ) : (
                      <Box display="flex" alignItems="center">
                        <Typography
                          variant="body2"
                          color="text.secondary"
                          sx={{ marginRight: 2 }}
                        >
                          SOL:
                        </Typography>
                        <Typography
                          variant="body2"
                          color="text.primary"
                          sx={{ fontWeight: "bold", marginRight: 2 }}
                        >
                          {walletBalance.toFixed(2)} SOL
                        </Typography>

                        <Typography
                          variant="body2"
                          color="text.secondary"
                          sx={{ marginRight: 2 }}
                        >
                          USDC:
                        </Typography>
                        <Typography
                          variant="body2"
                          color="text.primary"
                          sx={{ fontWeight: "bold", marginRight: 2 }}
                        >
                          {usdcBalance !== null
                            ? usdcBalance.toFixed(2)
                            : "Đang tải..."}{" "}
                          USDC
                        </Typography>

                        <Button
                          variant="outlined"
                          color="primary"
                          size="small"
                          onClick={disconnectWallet}
                          sx={{
                            borderColor: "primary.main",
                            color: "primary.main",
                            "&:hover": {
                              backgroundColor: "primary.main",
                              color: "white",
                            },
                          }}
                        >
                          Dừng
                        </Button>
                      </Box>
                    )}
                    {walletError && (
                      <Box sx={{ mt: 1 }}>
                        <Typography variant="body2" color="error">
                          {walletError}
                        </Typography>
                      </Box>
                    )}
                  </Box>

                  {/* User Dropdown */}
                  <Box marginLeft={3}>
                    {/* User Profile Dropdown */}
                    <IconButton
                      onMouseEnter={handleMouseEnter}
                      onMouseLeave={handleMouseLeave}
                      sx={{
                        display: "flex",
                        alignItems: "center",
                        textDecoration: "none",
                        color: "text.primary",
                      }}
                    >
                      <Avatar alt="User Avatar" src={logo} />
                    </IconButton>

                    <Menu
                      anchorEl={anchorEl}
                      open={Boolean(anchorEl)}
                      onClose={handleMouseLeave}
                      sx={{ minWidth: 150 }}
                      onMouseLeave={handleMouseLeave}
                    >
                      <MenuItem>
                        <Typography variant="body2">
                          User: {userData?.referenceId}
                        </Typography>
                      </MenuItem>
                      <Divider />
                      <MenuItem
                        onClick={handleLogout}
                        sx={{ color: "danger.main", fontSize: "14px" }}
                      >
                        Đăng xuất
                      </MenuItem>
                    </Menu>
                  </Box>
                </Box>
              </nav>

              {/* Main Content Area */}
              <div className="content-area">
                <Routes>
                  <Route path="/" element={<Navigate to="/home" replace />} />
                  <Route
                    path="/home"
                    element={<Home referenceId={userData?.referenceId} />}
                  />
                  <Route
                    path="/my-nfts"
                    element={
                      <MyNfts
                        referenceId={userData?.referenceId}
                        collectionId="ea9d4055-6d86-40f4-b58e-f652d8489328"
                      />
                    }
                  />
                  <Route
                    path="/user"
                    element={
                      <User
                        referenceId={userData?.referenceId}
                        email={userData?.email}
                      />
                    }
                  />
                  <Route
                    path="/exchange-rate"
                    element={
                      <Maket />
                    }
                  />
                  <Route
                    path="/map"
                    element={<Map />}
                  />
                </Routes>
              </div>
            </div>
          </div>
        )}
      </div>
    </Router>
  );
}

export default App;