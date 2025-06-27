"use client";
import { useState, useEffect } from "react";
import { Toaster, toast } from "sonner";
import Dashboard from "@/components/dashboard";
import Users from "@/components/users";
import Courses from "@/components/courses";
import Certificates from "@/components/certificates";
import Blog from "@/components/blog";
import Plans from "@/components/plans";
import HelpCenter from "@/components/help-center";
import Settings from "@/components/settings";
import Profile from "@/components/profile";
import Navbar from "@/components/navbar";
import Sidebar from "@/components/sidebar";
import SignInPage from "@/components/auth/signin-page";
import SignUpPage from "@/components/auth/signup-page";
import CommunityManagement from "@/components/community-management";
import RevenueAnalytics from "@/components/revenue-analytics";
import { getAccessibleTabs } from "@/components/auth/role-permissions";

export default function Home() {
  const [activeTab, setActiveTab] = useState("dashboard");
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [darkMode, setDarkMode] = useState(() =>
    typeof window !== "undefined"
      ? localStorage.getItem("darkMode") === "true"
      : false
  );
  const [isAuthenticated, setIsAuthenticated] = useState(null);
  const [authMode, setAuthMode] = useState("signin");
  const [userRole, setUserRole] = useState(null);
  const [user, setUser] = useState(null);
  const [showIdleModal, setShowIdleModal] = useState(false);
  const [countdown, setCountdown] = useState(120);

  const accessibleTabs = getAccessibleTabs(userRole);

  useEffect(() => {
    if (typeof window !== "undefined") {
      localStorage.setItem("darkMode", darkMode.toString());
      if (darkMode) {
        document.documentElement.classList.add("dark");
      } else {
        document.documentElement.classList.remove("dark");
      }
    }
  }, [darkMode]);

  useEffect(() => {
    let timeout;
    let countdownInterval;

    const fetchSession = async (retries = 2) => {
      try {
        if (typeof window === "undefined") return;
        const token = localStorage.getItem("token");
    
        if (!token) {
          setIsAuthenticated(false);
          return;
        }

        const res = await fetch("/api/session", {
          headers: { Authorization: `Bearer ${token}` },
        });
        const data = await res.json();
        if (!res.ok) {
          if (res.status === 404 && retries > 0) {
            console.warn(
              `Session fetch 404, retrying (${retries} attempts left)`
            );
            await new Promise((resolve) => setTimeout(resolve, 1000));
            return fetchSession(retries - 1);
          }
          throw new Error(
            data.message || `Session fetch failed: ${res.status}`
          );
        }
        setUserRole(data.user.role);
        setUser({
          id: data.user.id,
          email: data.user.email,
          role: data.user.role,
          name: data.user.name,
          lastLogin: data.user.lastActive || new Date().toISOString(),
        });
        setIsAuthenticated(true);
        setActiveTab(getAccessibleTabs(data.user.role)[0] || "dashboard");
        resetIdleTimer();
      } catch (err) {
        console.error("page.jsx: Session fetch error:", err.message);
        setIsAuthenticated(false);
        setUser(null);
        setUserRole(null);
        if (typeof window !== "undefined") {
          localStorage.removeItem("token");
          toast.error(`Session error: ${err.message}`);
        }
      }
    };

    const resetIdleTimer = () => {
      clearTimeout(timeout);
      clearInterval(countdownInterval);
      setShowIdleModal(false);
      setCountdown(120);
      timeout = setTimeout(() => {
        setShowIdleModal(true);
        countdownInterval = setInterval(() => {
          setCountdown((prev) => {
            if (prev <= 1) {
              clearInterval(countdownInterval);
              handleLogout();
              return 0;
            }
            return prev - 1;
          });
        }, 1000);
      }, 15 * 60 * 1000);
    };

    const events = ["mousemove", "keydown", "click", "scroll"];
    events.forEach((e) => document.addEventListener(e, resetIdleTimer));

    fetchSession();

    return () => {
      clearTimeout(timeout);
      clearInterval(countdownInterval);
      events.forEach((e) => document.removeEventListener(e, resetIdleTimer));
    };
  }, []);

  const handleSignIn = (userData) => {
    setUserRole(userData.role);
    setUser({
      id: userData.id,
      email: userData.email,
      role: userData.role,
      name: userData.name,
      lastLogin: userData.lastActive || new Date().toISOString(),
    });
    setIsAuthenticated(true);
    setActiveTab(getAccessibleTabs(userData.role)[0] || "dashboard");
  };

  const handleSignUp = (userData) => {
    setUserRole(userData.role);
    setUser({
      id: userData.id,
      email: userData.email,
      role: userData.role,
      name: userData.name,
      lastLogin: userData.lastActive || new Date().toISOString(),
    });
    setIsAuthenticated(true);
    setActiveTab(getAccessibleTabs(userData.role)[0] || "dashboard");
  };

  const handleLogout = async () => {
    if (typeof window === "undefined") return;
    const token = localStorage.getItem("token");
    try {
      await fetch("/api/logout", {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` },
      });
    } catch (err) {
      console.error("page.jsx: Logout error:", err.message);
    }
    setIsAuthenticated(false);
    setShowIdleModal(false);
    setAuthMode("signin");
    setUser(null);
    setUserRole(null);
    localStorage.removeItem("token");
    toast.info("Logged out successfully");
  };

  const handleStayLoggedIn = () => {
    setShowIdleModal(false);
    setCountdown(120);
  };

  const renderContent = () => {
    switch (activeTab) {
      case "dashboard":
        return <Dashboard />;
      case "users":
        return <Users session={user} />;
      case "courses":
        return <Courses />;
      case "certificates":
        return <Certificates />;
      case "blog":
        return <Blog />;
      case "community":
        return <CommunityManagement />;
      case "revenue":
        return <RevenueAnalytics />;
      case "plans":
        return <Plans />;
      case "help":
        return <HelpCenter />;
      case "settings":
        return <Settings />;
      case "profile":
        return <Profile />;
      default:
        return <EnhancedDashboard />;
    }
  };

  if (isAuthenticated === null) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100 dark:bg-gray-900">
        <div className="flex space-x-2">
          <div
            className="w-3 h-3 bg-blue-500 rounded-full animate-bounce"
            style={{ animationDelay: "0s" }}
          ></div>
          <div
            className="w-3 h-3 bg-blue-500 rounded-full animate-bounce"
            style={{ animationDelay: "0.2s" }}
          ></div>
          <div
            className="w-3 h-3 bg-blue-500 rounded-full animate-bounce"
            style={{ animationDelay: "0.4s" }}
          ></div>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return authMode === "signin" ? (
      <>
        <SignInPage
          onSignIn={handleSignIn}
          onSwitchToSignUp={() => setAuthMode("signup")}
        />
        <Toaster position="top-right" />
      </>
    ) : (
      <>
        <SignUpPage
          onSignUp={handleSignUp}
          onSwitchToSignIn={() => setAuthMode("signin")}
        />
        <Toaster position="top-right" />
      </>
    );
  }

  return (
    <div
      className={`min-h-screen bg-gray-100 dark:bg-gray-900 ${
        darkMode ? "dark" : ""
      }`}
    >
      <div className="flex h-screen overflow-hidden">
        <Sidebar
          activeTab={activeTab}
          setActiveTab={setActiveTab}
          sidebarOpen={sidebarOpen}
          setSidebarOpen={setSidebarOpen}
          userRole={userRole}
          user={user} // Added user prop
        />
        <div className="flex-1 flex flex-col overflow-hidden">
          <Navbar
            darkMode={darkMode}
            setDarkMode={setDarkMode}
            setSidebarOpen={setSidebarOpen}
            userRole={userRole}
            user={user}
          />
          <main className="flex-1 overflow-x-hidden overflow-y-auto bg-gray-100 dark:bg-gray-900 p-6">
            {renderContent()}
          </main>
        </div>
      </div>

      {showIdleModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-60">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6 w-full max-w-sm text-center">
            <h2 className="text-xl font-semibold text-gray-800 dark:text-white mb-4">
              Are you still there?
            </h2>
            <p className="text-gray-600 dark:text-gray-300 mb-6">
              You’ve been inactive for 15 minutes. You will be logged out in{" "}
              {Math.floor(countdown / 60)}:
              {(countdown % 60).toString().padStart(2, "0")}.
            </p>
            <div className="flex justify-center gap-4">
              <button
                onClick={handleStayLoggedIn}
                className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg"
              >
                Stay Logged In
              </button>
            </div>
          </div>
        </div>
      )}

      <Toaster position="top-right" />
    </div>
  );
}
