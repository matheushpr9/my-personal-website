import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { api, setToken } from "@/lib/api";

const Login = () => {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    try {
      const res = await api.post<{ token: string }>("/auth/login", { username, password });
      setToken(res.token);
      navigate("/admin");
    } catch (err: any) {
      setError(err.message);
    }
  };

  return (
    <div className="min-h-dvh flex items-center justify-center p-4">
      <form onSubmit={handleSubmit} className="panel-card p-8 w-full max-w-sm space-y-4">
        <h1 className="text-lg font-bold uppercase tracking-tighter text-foreground">Admin Login</h1>
        {error && <p className="text-xs text-destructive">{error}</p>}
        <input
          className="w-full bg-input border border-border rounded-sm px-3 py-2 text-sm text-foreground"
          placeholder="Username"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
        />
        <input
          className="w-full bg-input border border-border rounded-sm px-3 py-2 text-sm text-foreground"
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />
        <button type="submit" className="w-full bg-signal text-primary-foreground py-2 rounded-sm text-sm font-bold uppercase">
          Login
        </button>
      </form>
    </div>
  );
};

export default Login;
