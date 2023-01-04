import { useState } from 'react';
import { apiService } from '../api';
import { useNavigate }  from 'react-router-dom';
import { Link } from 'react-router-dom';

const Registration = () => {
    const [username, setUsername] = useState<string>("");
    const [password, setPassword] = useState<string>("");
    const [repeatedPassword, setRepeatedPassword] = useState<string>("");
    const [error, setError] = useState<boolean>(false);
    const navigate = useNavigate();

    async function registerRequest(e: React.FormEvent<HTMLFormElement>) {
        try {
            e.preventDefault();
            await apiService.register(username, password, repeatedPassword);

            navigate("/room/join", { replace: true });
        } catch(err) {
            console.log(`ERR: ${err}`);
            setError(true);
        }
    }

    return (
        <>
        <center>
            <h3>Register Form</h3>

            <form className="register-form" onSubmit={registerRequest}>
                <input type="text" placeholder="john..." onChange={(e) => {setUsername(e.target.value)}}/><br/><br/>
                <input type="password" placeholder="password" onChange={(e) => {setPassword(e.target.value)}}/><br/><br/>
                <input type="password" placeholder="repeat password" onChange={(e) => {setRepeatedPassword(e.target.value)}}/><br/><br/>
                <button type="submit">Register</button>

                { error && <p>Wrong credentials</p>}

                <p>Already registered ? <Link to="/login">Log in</Link></p>
            </form>
        </center>
        </>
        
    )
}

export default Registration;