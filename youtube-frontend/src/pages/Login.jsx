import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import AuthService from "../services/Authservice";

function Login() {
    const navigate = useNavigate();

    const [identifier, setIdentifier] = useState("");
    const [password, setPassword] = useState("");
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();

        try {
            setLoading(true);

            const isEmail = identifier.includes("@");

            const credentials = {
                [isEmail ? "email" : "username"]: identifier.trim(),
                password
            };

         await AuthService.login(credentials);

            toast.success("Login successful!");
            navigate("/");
        } catch (error) {
            console.error(
                "Login error:",
                error.response?.data || error
            );

            toast.error(
                error.response?.data?.message ||
                "Login failed"
            );
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="flex min-h-screen items-center justify-center bg-[#0f0f0f] px-4 text-white">
            <form
                onSubmit={handleSubmit}
                className="w-full max-w-md space-y-5 rounded-xl bg-[#181818] p-8"
            >
                <h1 className="text-center text-3xl font-bold">
                    Sign In
                </h1>

                <p className="text-center text-gray-400">
                    Welcome back to YouTube Clone
                </p>

                <input
                    type="text"
                    placeholder="Username or email"
                    value={identifier}
                    onChange={(e) => setIdentifier(e.target.value)}
                    required
                    className="w-full rounded-lg border border-gray-700 bg-[#0f0f0f] p-3 outline-none focus:border-red-500"
                />

                <input
                    type="password"
                    placeholder="Password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    className="w-full rounded-lg border border-gray-700 bg-[#0f0f0f] p-3 outline-none focus:border-red-500"
                />

                <button
                    type="submit"
                    disabled={loading}
                    className="w-full rounded-full bg-red-600 py-3 font-semibold hover:bg-red-700 disabled:opacity-50"
                >
                    {loading ? "Signing in..." : "Sign In"}
                </button>

                <p className="text-center text-gray-400">
                    Don't have an account?{" "}
                    <Link
                        to="/register"
                        className="text-blue-400 hover:underline"
                    >
                        Sign Up
                    </Link>
                </p>
            </form>
        </div>
    );
}

export default Login;