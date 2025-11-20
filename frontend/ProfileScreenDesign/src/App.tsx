import { ProfileScreen } from "./components/ProfileScreen";
import { AuthScreen } from "./components/AuthScreen";
import { useState } from "react";

export default function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  if (!isAuthenticated) {
    return <AuthScreen onAuthSuccess={() => setIsAuthenticated(true)} />;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-4 md:p-8">
      <ProfileScreen />
    </div>
  );
}