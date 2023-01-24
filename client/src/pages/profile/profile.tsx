import { useState } from 'react';
import { apiService } from "../../api";
import Modal from '../../components/modal';
import { useOutletContext } from 'react-router-dom';
import { IUser } from '../../interfaces';

const Profile = () => {
    const userContext: Omit<IUser, 'password'> = useOutletContext();
    const [profileImage, setProfileImage] = useState<string>(userContext.image as string);
    const [username, setUsername] = useState<string>("");
    const [changedUsername, setChangedUsername] = useState<string>("");
    const [currentPassword, setCurrentPassword] = useState<string>("");
    const [newPassword, setNewPassword] = useState<string>("");
    const [repeatPassword, setRepeatPassword] = useState<string>("");
    const [modalOn, setModalOn] = useState<boolean>(false);
    const [apiResponse, setApiResponse] = useState<string>("");
    const [requestSuccess, setRequestSuccess] = useState<boolean>(false);
    

    async function changeUsername(e: React.FormEvent<HTMLFormElement>) {
        e.preventDefault();
        try {
            const response = await apiService.changeUsername(username);

            setApiResponse("Username changed successfully");
            setChangedUsername(response.data.newUsername);
            setRequestSuccess(true);
        } catch(err: any) {
            setApiResponse(err.response.data.errMessage);
            setRequestSuccess(false);
        }
    }

    async function changePassword(e: React.FormEvent<HTMLFormElement>) {
        e.preventDefault();
        try {
            await apiService.changePassword(currentPassword, newPassword, repeatPassword);

            setApiResponse("Password changed successfully");
            setRequestSuccess(true);
        } catch(err: any) {
            setApiResponse(err.response.data.errMessage);
            setRequestSuccess(false);
        }
    }

    async function handleAvatarUpload(e: React.ChangeEvent<HTMLInputElement>) {
        try {
            if (!e.target.files?.[0]) return 

            const response = await apiService.changeAvatarImage(e.target.files?.[0]);

            setProfileImage(response.data.image);
            setRequestSuccess(true);
            setApiResponse("Avatar changed successfully");
        } catch(err) {
            setRequestSuccess(false);
            setApiResponse("Unable to change the avatar");
        }
    }

    return (
        <>
            <div id="modify_profile">
                <div className="profile_info">
                    <div id="profile_avatar" onClick={() => console.log("clieck")}>
                        <label htmlFor="avatar_update" className="drop-container">
                            <h5>Change</h5>
                            <input id="avatar_update" onChange={handleAvatarUpload} className="profile_image_update" type="file" accept=".jpg,.png,.jpeg"/>
                        </label>
                        <img src={profileImage.length === 0 
                            ? `http://${process.env.REACT_APP_HOSTNAME}:3003/images/${profileImage}`
                            : `http://${process.env.REACT_APP_HOSTNAME}:3003/images/${profileImage}`
                        } alt="" />
                    </div>
                    <h3>{changedUsername === "" ? userContext.username : changedUsername}</h3>
                </div>

                <div className="password_form">
                    <form onSubmit={changeUsername}>
                        <h5>New Username</h5>
                        <div id="modify_username">
                            <input id="username" autoComplete="off" type="text" 
                                value={username}
                                onChange={(e) => {setUsername(e.target.value)}}    
                            />
                            <button type="submit">Change</button>
                        </div>
                    </form>

                    <h5>Current Password</h5>
                    <div id="modify_password">
                        <input className="current_password" type="password" 
                            value={currentPassword}
                            onChange={(e) => {setCurrentPassword(e.target.value)}}    
                        />
                        <button type="submit" onClick={() => setModalOn(true)}>Change</button>
                    </div>
                </div>
            </div>
            {modalOn && 
            <Modal setModalOn={setModalOn}>
                <>
                <form onSubmit={changePassword}>
                    <div id="reset_password_form">
                            <h2>Update your password</h2>
                            <h5>Current Password</h5>   
                            <input className="current_password" type="password" 
                                value={currentPassword}
                                onChange={(e) => {setCurrentPassword(e.target.value)}}    
                            />
                            <h5>New Password</h5>   
                            <input type="password" 
                                value={newPassword}
                                onChange={(e) => {setNewPassword(e.target.value)}}    
                            />
                            <h5>Confirm New Password</h5>   
                            <input type="password"
                                value={repeatPassword}
                                onChange={(e) => {setRepeatPassword(e.target.value)}}    
                            />
                    </div>

                    <div className="submit_password_button">
                        <button type="submit">Done</button>
                    </div>
                </form>
                </> 
            </Modal>}
            <p id="modify_response" className={requestSuccess ? "success" : "err"}>{apiResponse}</p>
        </>
    )
}

export default Profile;