import { Dispatch, SetStateAction } from "react";

export interface AuthFormParams {
    showPassword: boolean;
    setShowPassword: Dispatch<SetStateAction<boolean>>;
    setIsSubmitting: Dispatch<SetStateAction<boolean>>
}