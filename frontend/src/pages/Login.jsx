import { useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { LoaderCircle, LogIn } from "lucide-react";

import { authApi } from "../services/auth.api";
import { showToast } from "../components/common/ToastHost";

export default function Login() {
  const navigate = useNavigate();
  const location = useLocation();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (event) => {
    event.preventDefault();

    setError("");
    if (!email.trim() || !email.includes("@")) { setError("Enter a valid email address."); return; }
    if (!password) { setError("Enter your password."); return; }
    setLoading(true);

    try {
      const response = await authApi.login(
        email.trim(),
        password
      );

      const tokens = response.data?.tokens;
      const user = response.data?.user;

      if (!tokens?.accessToken) {
        throw new Error(
          "Login succeeded but no access token was returned."
        );
      }

      localStorage.setItem(
        "jobguard_access_token",
        tokens.accessToken
      );

      if (tokens.refreshToken) {
        localStorage.setItem(
          "jobguard_refresh_token",
          tokens.refreshToken
        );
      }

      if (user) {
        localStorage.setItem(
          "jobguard_user",
          JSON.stringify(user)
        );
      }

      const destination =
        location.state?.from?.pathname || "/scan";

      showToast("Signed in successfully.", "success");
      navigate(destination, { replace: true });
    } catch (err) {
      setError(
        err.message || "Unable to login."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full">
      <form
        onSubmit={handleSubmit}
        autoComplete="off"
        className="space-y-5"
      >
        <input aria-hidden="true" tabIndex="-1" name="website" className="sr-only" autoComplete="off" />

        {error && (
          <div className="rounded-xl border border-red-200 bg-red-50 p-3 text-sm text-red-700">
            {error}
          </div>
        )}

        <div>
          <label className="text-sm font-bold">
            Email
          </label>

          <input
            type="email"
            value={email}
            onChange={(event) =>
              setEmail(event.target.value)
            }
            placeholder="you@example.com"
            required
            autoComplete="email"
            className="mt-2 h-12 w-full rounded-xl border border-slate-200 px-4 outline-none transition focus:border-[#4f46e5] focus:ring-4 focus:ring-[#4f46e5]/10"
          />
        </div>

        <div>
          <label className="text-sm font-bold">
            Password
          </label>

          <input
            type="password"
            value={password}
            onChange={(event) =>
              setPassword(event.target.value)
            }
            placeholder="Enter your password"
            required
            autoComplete="current-password"
            className="mt-2 h-12 w-full rounded-xl border border-slate-200 px-4 outline-none transition focus:border-[#4f46e5] focus:ring-4 focus:ring-[#4f46e5]/10"
          />
        </div>

        <button
          type="submit"
          disabled={loading}
          className="flex h-12 w-full items-center justify-center gap-2 rounded-xl bg-[#4f46e5] font-bold text-white transition hover:bg-[#4338ca] disabled:cursor-not-allowed disabled:opacity-60"
        >
          {loading ? (
            <>
              <LoaderCircle
                size={19}
                className="animate-spin"
              />
              Logging in...
            </>
          ) : (
            <>
              <LogIn size={19} />
              Login
            </>
          )}
        </button>
      </form>
    </div>
  );
}