import './App.css';
import {Routes, Route } from 'react-router-dom';
import Chat from './components/chat';
import JoinRoom from './components/joinRoom';
import Registration from './components/registration';
import Login from './components/login';
import RequireAuth from './components/verifyAuth';
import CreateRoom from './components/createRoom';

function App() {
  return (
    <div className="App">
      <Routes>
        <Route path="/register" element={<Registration />}></Route>
        <Route path="/login" element={<Login />}></Route>

        <Route element={<RequireAuth />}>
          <Route path="/chat/:room" element={<Chat />}></Route>
          <Route path="/room/join" element={<JoinRoom />}></Route>
          <Route path="/room/create" element={<CreateRoom />}></Route>
        </Route>
      </Routes>
    </div>
  );
}

export default App;
