import { useState } from 'react';
import { apiService } from '../api';
import { useNavigate }  from 'react-router-dom';
import { Link } from 'react-router-dom';

const Registration = () => {
    const [username, setUsername] = useState<string>("");
    const [password, setPassword] = useState<string>("");
    const [repeatedPassword, setRepeatedPassword] = useState<string>("");
    const [apiError, setApiError] = useState<string>("");
    const navigate = useNavigate();

    async function registerRequest(e: React.FormEvent<HTMLFormElement>) {
        try {
            e.preventDefault();
            await apiService.register(username, password, repeatedPassword);

            navigate("/lobby", { replace: true });
        } catch(err: any) {
            setApiError(`Oops: ${err.response.data.errMessage}`);
        }
    }

    return (
        <form className="formContainer" onSubmit={registerRequest}>
            <h3>Register Form</h3>

            <input type="text" placeholder="john..." onChange={(e) => {setUsername(e.target.value)}}/><br/><br/>
            <input type="password" placeholder="password" onChange={(e) => {setPassword(e.target.value)}}/><br/><br/>
            <input type="password" placeholder="repeat password" onChange={(e) => {setRepeatedPassword(e.target.value)}}/><br/><br/>
            <button type="submit">Register</button>

            { apiError && <p className='err'>{apiError}</p>}

            <p>Already registered ? <Link to="/login">Log in</Link></p>
        </form>        
    )
}

export default Registration;