import { Router } from 'express';
import RoomController from '../controllers/RoomController';
import UserController from '../controllers/UserController';
import * as UserValidate from '../validations/userValidate';
import * as RoomValidate from '../validations/roomValidate';
import { checkAuth } from '../middlewares/checkAuth';

const router = Router();

router.post("/register", UserValidate.register, UserController.register);
router.post("/login", UserValidate.login, UserController.login);
router.get("/user", checkAuth, UserController.getUser);

router.post("/room/create", checkAuth, RoomValidate.create, RoomController.create);
router.post("/room/join", checkAuth, RoomValidate.join, RoomController.join);

export default router;