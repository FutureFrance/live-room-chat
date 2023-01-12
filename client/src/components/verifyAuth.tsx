import { useEffect, useState } from "react";
import { Outlet } from "react-router"
import { apiService } from "../api";

const RequireAuth = ({children}: any) => {
    const [isAuth, setIsAuth] = useState<boolean>(false);

    async function verifyAuth() {
        try {
            await apiService.auth();

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
            ? <main><Outlet /></main>
            : <p>Loading</p>
        }
        </>
    )
}

export default RequireAuth;