export class ApiError extends Error {
    errors: any = [];
    status = 0;

    constructor(status: number, message: string, errors: any[] = []) {
        super(message);
        this.errors = errors;
        this.status = status;
    }

    static BadRequest(status: number, message: string, errors: any[] = [] ) {
        return new ApiError(status, message, errors);
    }

    static Unauthorized() {
        return new ApiError(401, "User is unauthorized");
    }
} 