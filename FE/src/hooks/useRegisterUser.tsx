import { useEffect, useRef, useState } from "react";
import useAuth from "./useAuth"; // Assuming useAuth is in the same directory
import { apiClient } from "../services/ApiClient"; // Assuming you still have this

interface UserRegistration {
    email: string | null | undefined;
    name: string | null | undefined;
    id: string | undefined; // Supabase uses 'id'
}

export function useRegisterUser() {
    const { user, supabaseClient, isAuthenticated, session } = useAuth();
    const hasRegistered = useRef(false);
    const [isInitializing, setIsInitializing] = useState(true);

    const [registeredUser, setRegisteredUser] = useState<UserRegistration | null>(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<Error | null>(null);

    useEffect(() => {
        if (session !== undefined) {
            setIsInitializing(false);
        }
    }, [session]);

    useEffect(() => {
        const registerUser = async () => {
            if (!isAuthenticated || !user || hasRegistered.current || isInitializing) return;

            setLoading(true);
            setError(null);

            try {
                const { data: sessionData, error: sessionError } = await supabaseClient.auth.getSession();
                const token = sessionData?.session?.access_token;

                if (!token) {
                    setError(new Error("No access token available"));
                    setLoading(false);
                    return;
                }

                const userData: UserRegistration = {
                    email: user.email,
                    name: user.identities?.[0]?.identity_data?.name || user.email, // Try to get name from social login, fallback to email
                    id: user.id,
                };

                const { error: apiError, data } = await apiClient.post<UserRegistration>(
                    "/users", // Your backend endpoint for registering/creating users
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
    }, [isAuthenticated, user, supabaseClient, isInitializing]);

    return { registeredUser, loading, error, isInitializing };
}