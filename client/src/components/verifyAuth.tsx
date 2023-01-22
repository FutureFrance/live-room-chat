import { useEffect, useState } from "react";
import { Outlet } from "react-router"
import { apiService } from "../api";
import { IUser } from "../interfaces";

const RequireAuth = () => {
    const [isAuth, setIsAuth] = useState<boolean>(false);
    const [response, setResponse] = useState<Omit<IUser, 'password'>>();

    async function verifyAuth() {
        try {
            const response = await apiService.auth();

            setResponse(response.data);
            setIsAuth(true);
        } catch(err: any) {
            console.log("Unauthorized");
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