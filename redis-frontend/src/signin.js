import "./signin.css";
import { useState } from "react";
import axios from "axios";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import 'bootstrap/dist/css/bootstrap.min.css';
import { useNavigate } from "react-router-dom";
import iliganLogo from './images/iligan_logo.png';
import tambcanLogo from './images/tambcan_logo.png';


const API_URL = "http://localhost:5000/login";

function Signin({ onLogin }) {
    const navigate = useNavigate()

    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [error, setError] = useState("");

    const handleLogin = async (e) => {
        e.preventDefault();
        setError("");
    
        try {
            const response = await axios.post(API_URL, { email, password });
    
            // Check response status directly
            if (response.data.success) {
                setError("");
                toast.success("Login successful!");
                localStorage.setItem("isAuthenticated", "true");
                navigate("/mainapp"); 
            } else {
                setError("Invalid email or password."); 
            }
        } catch (error) {
            // Check if error is from the backend response (e.g., 401 Unauthorized)
            if (error.response) {
                setError("Invalid email or password.");
                //toast.error(error.response.data.message || "Invalid credentials.");
            } else {
                console.error("Error connecting to server:", error);
                toast.error("Error connecting to server.");
            }
        }
    };    


    return (
        <div className="signincontainer">
            <div className="signintop">
                <img src={tambcanLogo} alt="Tambacan Logo" id="tambacanlogo" />
                <div id="signintitle">Tambacan Profiling System</div>
                <img src={iliganLogo} alt="Iligan City Logo" id="iliganlogo"/>
            </div>
            <div className="cssbox1">
                <form onSubmit={handleLogin}>
                    <div id="emailHelp" className="form-text">Enter your login credentials</div>
                    <div className="mb-3">
                        <label htmlFor="exampleInputEmail1" className="form-label">Email</label>
                        <input type="email" className="form-control" id="exampleInputEmail1" value={email} onChange={(e) => setEmail(e.target.value)} required />
                    </div>
                    <div className="mb-3">
                        <label htmlFor="exampleInputPassword1" className="form-label">Password</label>
                        <input type="password" className="form-control" id="exampleInputPassword1" value={password} onChange={(e) => setPassword(e.target.value)} required />
                    </div>
                    {error && <div className="alert alert-danger">{error}</div>}
                    <div className="cssloginbutton">
                        <button type="submit" className="btn" id="cssloginbutton">Login</button>
                    </div>
                </form>
            </div>
            <ToastContainer />
        </div>
    );
}

export default Signin;