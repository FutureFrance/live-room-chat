import { useEffect, useState } from "react";
import { Outlet, useNavigate } from "react-router-dom";
import { apiService } from "../api";
import { IUser } from "../interfaces";

const RequireAuth = () => {
    const [isAuth, setIsAuth] = useState<boolean>(false);
    const [response, setResponse] = useState<Omit<IUser, 'password'>>();
    const navigate = useNavigate();

    async function verifyAuth() {
        try {
            const response = await apiService.auth();

            setResponse(response.data);
            setIsAuth(true);
        } catch(err: any) {
            setIsAuth(false);
            navigate('/login', {replace: true});
        }
    }

    useEffect(() => {
        verifyAuth();
    }, []);

    return (
        <>
        {isAuth 
            ? <main><Outlet context={response}/></main>
            : <p>Loading</p>
        }
        </>
    )
}

export default RequireAuth;