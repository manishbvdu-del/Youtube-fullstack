import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import AuthService from "../services/Authservice";

function Register() {
    const navigate = useNavigate();

    const [fullname, setFullname] = useState("");
    const [username, setUsername] = useState("");
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [avatar, setAvatar] = useState(null);
    const [coverImage, setCoverImage] = useState(null);
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e) => {
    e.preventDefault();

    if (!avatar) {
        toast.error("Please select a profile picture");
        return;
    }

    try {
        setLoading(true);

        const formData = new FormData();

        formData.append("fullname", fullname);
        formData.append("username", username);
        formData.append("email", email);
        formData.append("password", password);
        formData.append("avatar", avatar);

        if (coverImage) {
            formData.append("coverImage", coverImage);
        }

        console.log("Selected avatar:", avatar);
        console.log("Avatar field:", formData.get("avatar"));

        for (const [key, value] of formData.entries()) {
            console.log(
                key,
                value instanceof File ? value.name : value
            );
        }

       const result = await AuthService.register(formData);
       
        console.log("Registration response:", result);
        toast.success("Registration successful!");
        navigate("/login");
    } catch (error) {
        console.error("Registration error:", error.response?.data || error);

        toast.error(
            error.response?.data?.message ||
            "Registration failed"
        );
    } finally {
        setLoading(false);
    }
};
    

    return (
        <div className="flex min-h-screen items-center justify-center bg-[#0f0f0f] px-4 py-8 text-white">
            <form
                onSubmit={handleSubmit}
                className="w-full max-w-md space-y-4 rounded-xl bg-[#181818] p-8"
            >
                <h1 className="text-center text-3xl font-bold">
                    Create Account
                </h1>

                <p className="text-center text-gray-400">
                    Join YouTube Clone
                </p>

                <input
                    type="text"
                    placeholder="Full name"
                    value={fullname}
                    onChange={(e) => setFullname(e.target.value)}
                    required
                    className="w-full rounded-lg border border-gray-700 bg-[#0f0f0f] p-3 outline-none focus:border-red-500"
                />

                <input
                    type="text"
                    placeholder="Username"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    required
                    className="w-full rounded-lg border border-gray-700 bg-[#0f0f0f] p-3 outline-none focus:border-red-500"
                />

                <input
                    type="email"
                    placeholder="Email address"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
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

                <div>
                    <label className="mb-2 block text-sm text-gray-300">
                        Profile Picture (Required)
                    </label>

                    <input
                        type="file"
                        accept="image/*"
                        onChange={(e) =>
                            setAvatar(e.target.files?.[0] || null)
                        }
                        required
                        className="w-full text-sm text-gray-400"
                    />
                </div>

                <div>
                    <label className="mb-2 block text-sm text-gray-300">
                        Cover Image 
                    </label>

                    <input
                        type="file"
                        accept="image/*"
                        onChange={(e) =>
                            setCoverImage(e.target.files?.[0] || null)
                        }
                        className="w-full text-sm text-gray-400"
                    />
                </div>

                <button
                    type="submit"
                    disabled={loading}
                    className="w-full rounded-full bg-red-600 py-3 font-semibold hover:bg-red-700 disabled:opacity-50"
                >
                    {loading ? "Creating account..." : "Sign Up"}
                </button>

                <p className="text-center text-gray-400">
                    Already have an account?{" "}
                    <Link
                        to="/login"
                        className="text-blue-400 hover:underline"
                    >
                        Login
                    </Link>
                </p>
            </form>
        </div>
    );
}

export default Register;