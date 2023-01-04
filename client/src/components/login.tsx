import { useState } from 'react';
import { apiService } from '../api';
import { Link, useNavigate } from 'react-router-dom';

const Registration = () => {
    const [username, setUsername] = useState<string>("");
    const [password, setPassword] = useState<string>("");
    const [success, setSuccess] = useState<string>("");
    const navigate = useNavigate();

    async function loginRequest(e: React.FormEvent<HTMLFormElement>) {
        try {
            e.preventDefault();
            await apiService.login(username, password);
            
            navigate('/room/join', {replace: true});
            setSuccess("true");
        } catch(err) {
            setSuccess("false");
            console.log(`ERR: ${err}`);
        }
    }

    return (
        <>
        <center>
            <h3>Login Form</h3>

            <form className="register-form" onSubmit={loginRequest}>
                <input type="text" placeholder="john..." onChange={(e) => {setUsername(e.target.value)}}/><br/><br/>
                <input type="password" placeholder="password" onChange={(e) => {setPassword(e.target.value)}}/><br/><br/>
                <button type="submit">Login</button>
            </form>

            { success === "true"  ? <p>Successfull login</p>  
            : success === "false" ? <p>Wrong credentials</p> : ""}

            <p>Don't have an account ? <Link to="/register">Register</Link></p>
        </center>
        </>
    )
}

export default Registration;