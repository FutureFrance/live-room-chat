import './App.css';
import {Routes, Route } from 'react-router-dom';
import Chat from './pages/chat/chat';
import JoinRoom from './pages/joinRoom/joinRoom';
import Registration from './pages/registeration/registration';
import Login from './pages/login/login';
import RequireAuth from './components/verifyAuth';
import CreateRoom from './pages/createRoom/createRoom';
import Lobby from './pages/lobby/lobby';
import Redirect from './components/redirect';
import Profile from './pages/profile/profile';

function App() {
  return (
    <div className="App">
      <Routes>
        <Route path="/register" element={<Registration />}></Route>
        <Route path="/login" element={<Login />}></Route>

        <Route element={<RequireAuth />}>
          <Route path="/chat/:room" element={<Chat />}></Route>
          <Route path="/room/join" element={<JoinRoom />}></Route>
          <Route path="/lobby" element={<Lobby />}></Route>
          <Route path="/room/create" element={<CreateRoom />}></Route>
          <Route path="/profile" element={<Profile/>}></Route>
        </Route>

        <Route path="/*" element={<Redirect />}></Route>
      </Routes>
    </div>
  );
}

export default App;
