import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { LoaderCircle, UserPlus } from "lucide-react";

import { authApi } from "../services/auth.api";
import { showToast } from "../components/common/ToastHost";

export default function Signup() {
  const navigate = useNavigate();

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] =
    useState("");

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (event) => {
    event.preventDefault();

    setError("");

    if (!name.trim() || name.trim().length < 2) { setError("Name must be at least 2 characters."); return; }
    if (!email.includes("@")) { setError("Enter a valid email address."); return; }
    if (password !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    if (password.length < 8) {
      setError(
        "Password must be at least 8 characters."
      );
      return;
    }

    setLoading(true);

    try {
      const response = await authApi.register(
        name.trim(),
        email.trim(),
        password
      );

      const tokens = response.data?.tokens;
      const user = response.data?.user;

      if (tokens?.accessToken) {
        localStorage.setItem(
          "jobguard_access_token",
          tokens.accessToken
        );
      }

      if (tokens?.refreshToken) {
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

      showToast("Account created successfully.", "success");
      navigate("/scan", { replace: true });
    } catch (err) {
      setError(
        err.message || "Unable to create your account."
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
            Name
          </label>

          <input
            type="text"
            value={name}
            onChange={(event) =>
              setName(event.target.value)
            }
            placeholder="Your name"
            required
            autoComplete="name"
            className="mt-2 h-12 w-full rounded-xl border border-slate-200 px-4 outline-none transition focus:border-[#4f46e5] focus:ring-4 focus:ring-[#4f46e5]/10"
          />
        </div>

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
            placeholder="Create a password"
            required
            autoComplete="new-password"
            className="mt-2 h-12 w-full rounded-xl border border-slate-200 px-4 outline-none transition focus:border-[#4f46e5] focus:ring-4 focus:ring-[#4f46e5]/10"
          />
        </div>

        <div>
          <label className="text-sm font-bold">
            Confirm Password
          </label>

          <input
            type="password"
            value={confirmPassword}
            onChange={(event) =>
              setConfirmPassword(event.target.value)
            }
            placeholder="Confirm your password"
            required
            autoComplete="new-password"
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
              Creating account...
            </>
          ) : (
            <>
              <UserPlus size={19} />
              Create Account
            </>
          )}
        </button>
      </form>
    </div>
  );
}