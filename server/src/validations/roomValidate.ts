import { body, query } from 'express-validator';

export const join = [
    body("room_name", "Must be between 3 and 22 characters").isLength({min: 3, max: 22}),
    body("room_password", "Must be at least 6 characters").isLength({min: 6, max: 29}),
];

export const create = [
    body("room_name", "Must be between 3 and 22 characters").isLength({min: 3, max: 22}),
    body("password", "Must be at least 6 characters").isLength({min: 6, max: 29}),
    body("repeat_password", "Must be at least 6 characters").isLength({min: 6, max: 29}),
];

export const upload = [
    body("room"),
    body("room_image")
]

export const filterMessage = [
    query("room", "Invalid Room").isLength({min: 24, max: 24}),
    query("query", "This query is too long or too short").isLength({min: 1, max: 59}),
]

export const updateRoomName = [
    body("room_name").isLength({min: 3, max: 22}),
    body("room", "Invalid Room").isLength({min: 24, max: 24})
]

export const updateRoomPassword = [
    body("room_name").isLength({min: 3, max: 22}),
    body("current_password", "Must be at least 6 characters").isLength({min: 6, max: 29}),
    body("password", "Must be at least 6 characters").isLength({min: 6, max: 29}),
    body("repeat_password", "Must be at least 6 characters").isLength({min: 6, max: 29})
]