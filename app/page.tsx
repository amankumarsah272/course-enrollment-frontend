"use client";

import { useState, type FormEvent } from "react";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setMessage("");
    setLoading(true);

    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/auth/login`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ email: email.trim(), password }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        setMessage(
          typeof data.message === "string"
            ? data.message
            : "Login failed."
        );
        return;
      }

      localStorage.setItem("token", data.access_token);
      localStorage.setItem("user", JSON.stringify(data.user));

      window.location.href =
        data.user.role === "ADMIN" ? "/admin" : "/student";
    } catch {
      setMessage("Cannot connect to backend. Check if it is running.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="flex min-h-screen items-center justify-center bg-[#dfe6e9] px-4 py-8">
      <section className="w-full max-w-md rounded-[20px] bg-[#dfe6e9] p-8 shadow-[8px_8px_16px_#b8c1c5,-8px_-8px_16px_#ffffff]">
        <div className="mb-7 text-center">
          <h1 className="text-3xl font-bold text-[#2d3436]">
            Welcome Back
          </h1>
          <p className="mt-2 text-sm text-[#636e72]">
            Course Enrollment System
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label htmlFor="email" className="mb-2 block text-sm font-semibold text-[#2d3436]">
              Email Address
            </label>
            <input
              id="email"
              type="email"
              required
              autoComplete="username"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Enter your email"
              className="w-full rounded-[14px] border-0 bg-[#dfe6e9] px-4 py-3 text-[#2d3436] placeholder:text-[#636e72] shadow-[inset_4px_4px_8px_#b8c1c5,inset_-4px_-4px_8px_#ffffff] outline-none focus:ring-2 focus:ring-[#0984e3]"
            />
          </div>

          <div>
            <label htmlFor="password" className="mb-2 block text-sm font-semibold text-[#2d3436]">
              Password
            </label>
            <input
              id="password"
              type="password"
              required
              autoComplete="current-password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Enter your password"
              className="w-full rounded-[14px] border-0 bg-[#dfe6e9] px-4 py-3 text-[#2d3436] placeholder:text-[#636e72] shadow-[inset_4px_4px_8px_#b8c1c5,inset_-4px_-4px_8px_#ffffff] outline-none focus:ring-2 focus:ring-[#0984e3]"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-[14px] bg-[#dfe6e9] py-3 font-bold text-[#2d3436] shadow-[5px_5px_10px_#b8c1c5,-5px_-5px_10px_#ffffff] transition hover:shadow-[inset_3px_3px_6px_#b8c1c5,inset_-3px_-3px_6px_#ffffff] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#0984e3] disabled:opacity-60"
          >
            {loading ? "Logging in..." : "Login"}
          </button>

          {message && (
            <p role="alert" className="break-words text-center text-sm font-medium text-[#c0392b]">
              {message}
            </p>
          )}
        </form>
      </section>
    </main>
  );
}
