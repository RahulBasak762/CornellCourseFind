/* eslint-disable no-unused-vars */
/* eslint-disable react/prop-types */
import {useState} from "react"
import api from "../api"
import { useNavigate, Link } from "react-router-dom"
import { ACCESS_TOKEN, REFRESH_TOKEN} from "../constants"
import "../styles/Form.css"

function Form({route, method}){
    const [username, setUsername] = useState("");
    const [password, setPassword] = useState("");
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();
    const name = method === "login" ? "Sign in" : "Create an account";
    const buttonName = method  === "login" ? "Login" : "Register";

    const handleSubmit = async (e) => {
        setLoading(true);
        e.preventDefault();
        try {
            const res = await api.post(route, { username, password })
            if (method === "login") {
                localStorage.setItem(ACCESS_TOKEN, res.data.access)
                localStorage.setItem(REFRESH_TOKEN, res.data.refresh)
                navigate("/")
            }
            else{
                navigate("/login")
            }
        }
        catch(error) {
            if (error.response && error.response.status === 401) {
                alert("Invalid username or password");
            } 
            else if (error.response && error.response.status === 400 && method === "register"){
                alert("Account already exists")
            }
            else {
                alert(error);
            }
        }
        finally {
            setLoading(false);
        }
    }

    return (
        <div>
            
            <div className="Task-Bar">
                <li></li>
                <li className="title"><h2>CourseFind</h2></li>           
                <li></li> 
            </div>

            <br/>


            <div className="form-container">
                <form onSubmit={handleSubmit}>
                    <h1 className="name">{name}</h1>
                    <input 
                        required 
                        className="form-input"
                        type="text"
                        value={username}
                        onChange={(e) => setUsername(e.target.value)}
                        placeholder="Username"
                    />
                    <input 
                        required 
                        className="form-input"
                        type="password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        placeholder="Password"
                    />
                    <button className="form-button" type="submit">
                        {buttonName}
                    </button>
                </form>
                <p className="form-footer">
                    {method === "login" ? (
                        "Don't have an account? "
                    ) : (
                        "Already have an account? "
                    )}
                    {method === "login" ? (
                        <Link to="/register">Create One.</Link>
                    ) : (
                        <Link to="/login">Sign in.</Link>
                    )}
                </p>
            </div>
        </div>
    )
}

export default Form