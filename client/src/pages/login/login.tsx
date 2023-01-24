import { useState } from 'react';
import { apiService } from '../../api';
import { Link, useNavigate } from 'react-router-dom';

const Registration = () => {
    const [username, setUsername] = useState<string>("");
    const [password, setPassword] = useState<string>("");
    const [apiError, setApiError] = useState<string>("");
    const navigate = useNavigate();

    async function loginRequest(e: React.FormEvent<HTMLFormElement>) {
        e.preventDefault();

        if (username.length < 3 || username.length > 22) {
            setApiError('username must be between 3 and 22 characters');
            return;
        }

        if (password.length < 6 || password.length > 29) {
            setApiError('password must be between 3 and 22 characters');
            return;
        }

        try {
            e.preventDefault();
            await apiService.login(username, password);
            
            navigate('/lobby', {replace: true});
        } catch(err: any) {
            setApiError(`Oops: ${err.response.data.errMessage}`);
        }
    }

    return (
        <>
            <form className="formContainer" onSubmit={loginRequest}>
                <h3>Login Form</h3>

                <input type="text" placeholder="john..." onChange={(e) => {setUsername(e.target.value)}}/><br/><br/>
                <input type="password" placeholder="password" onChange={(e) => {setPassword(e.target.value)}}/><br/><br/>
                <button type="submit">Login</button>

                { apiError && <p className='err'>{apiError}</p>}

                <p>Don't have an account ? <Link to="/register">Register</Link></p>
            </form>
        </>
    )
}

export default Registration;