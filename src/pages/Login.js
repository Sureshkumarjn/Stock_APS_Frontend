import { useContext, useState } from "react";
import { useNavigate } from "react-router-dom";
import AuthContext from "../AuthContext";
import { BASE_URL } from "../config";
import Swal from "sweetalert2";
import { RingLoader } from "react-spinners"; // Import new loader

function Login() {
  const [form, setForm] = useState({ email: "", password: "" });
  const [loading, setLoading] = useState(false);
  const authContext = useContext(AuthContext);
  const navigate = useNavigate();

  const handleInputChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const loginUser = async (e) => {
    e.preventDefault();

    if (!form.email || !form.password) {
      Swal.fire({
        icon: "warning",
        title: "Oops...",
        text: "To login, enter your details!",
        confirmButtonColor: "#007BFF",
      });
      return;
    }

    setLoading(true); // Show loader

    try {
      const response = await fetch(BASE_URL + `api/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });

      const data = await response.json();
      setLoading(false); // Hide loader

      if (!response.ok) {
        throw new Error(data.message || "Wrong credentials, Try again!");
      }

      Swal.fire({
        icon: "success",
        title: "Login Successful!",
        text: "You are now logged in.",
        confirmButtonColor: "#007BFF",
      }).then(() => {
        localStorage.setItem("user", JSON.stringify(data));
        authContext.signin(data._id, () => navigate("/"));
      });
    } catch (error) {
      setLoading(false); // Hide loader
      setForm((prev) => ({ ...prev, password: "" })); // Clear password field

      Swal.fire({
        icon: "error",
        title: "Login Failed",
        text: "Please check your credentials and try again.",
        confirmButtonColor: "#007BFF",
      });
    }
  };

  return (
    <div className="relative">
      {/* Fullscreen Loader */}
      {loading && (
        <div className="fixed inset-0 bg-gray-900 bg-opacity-50 backdrop-blur-md flex justify-center items-center z-50">
          <RingLoader size={80} color={"#ffffff"} loading={loading} />
        </div>
      )}

      {/* Login Form */}
      <div className="grid grid-cols-1 sm:grid-cols-2 h-screen items-center place-items-center">
        <div className="flex justify-center">
          <img src={require("../assets/signup.jpg")} alt="" />
        </div>
        <div className="w-full max-w-md space-y-8 p-10 rounded-lg bg-white shadow-lg">
          <div>
            <img
              className="mx-auto h-12 w-auto"
              src={require("../assets/logo.png")}
              alt="Logo"
            />
            <h2 className="mt-6 text-center text-3xl font-bold text-gray-900">
              Sign in to your account
            </h2>
          </div>
          <form className="mt-8 space-y-6" onSubmit={loginUser}>
            <div className="-space-y-px rounded-md shadow-sm">
              <input
                name="email"
                type="email"
                placeholder="Email address"
                className="form-control block w-full rounded-t-md border px-3 py-2 mb-3"
                value={form.email}
                onChange={handleInputChange}
                required
              />
              <input
                name="password"
                type="password"
                placeholder="Password"
                className="form-control block w-full rounded-b-md border px-3 py-2"
                value={form.password}
                onChange={handleInputChange}
                required
              />
            </div>
            <button
              type="submit"
              className="group relative flex w-full justify-center rounded-md bg-indigo-600 py-2 text-white hover:bg-indigo-500 disabled:opacity-50"
              disabled={loading} // Disable button when loading
            >
              Sign in
            </button>
            <p className="mt-2 text-center text-sm text-gray-600">
              Developed by © APS
            </p>
          </form>
        </div>
      </div>
    </div>
  );
}

export default Login;
