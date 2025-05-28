import { useAuth0 } from "@auth0/auth0-react";
import { useEffect, useRef, useState } from "react";
import { apiClient } from "../services/ApiClient";

interface UserRegistration {
    email: string;
    name: string;
    sub: string;
}

export function useRegisterUser() {
    const { isAuthenticated, getAccessTokenSilently, user, isLoading: authLoading } = useAuth0();
    const hasRegistered = useRef(false);

    const [registeredUser, setRegisteredUser] = useState<UserRegistration | null>(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<Error | null>(null);

    useEffect(() => {
        const registerUser = async () => {
            if (!isAuthenticated || !user || hasRegistered.current) return;

            setLoading(true);
            setError(null);

            try {
                const token = await getAccessTokenSilently();
                const userData: UserRegistration = {
                    email: user.email ?? '',
                    name: user.name ?? '',
                    sub: user.sub!,
                };

                const { error: apiError, data } = await apiClient.post<UserRegistration>(
                    "/users",
                    userData,
                    token
                );

                if (apiError) {
                    setError(new Error(apiError));
                    console.error("Failed to register user:", apiError);
                    setLoading(false);
                    return;
                }

                if (data) {
                    setRegisteredUser(data);
                    hasRegistered.current = true;
                }
                setLoading(false);
            } catch (err) {
                setError(err as Error);
                console.error("Error registering user:", err);
                setLoading(false);
            }
        };

        registerUser();
    }, [isAuthenticated, user, getAccessTokenSilently]);

    return { registeredUser, loading: loading || authLoading, error };
}