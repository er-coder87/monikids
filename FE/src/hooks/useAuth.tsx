import { useSession, useSupabaseClient } from '@supabase/auth-helpers-react';
import { Session, SupabaseClient } from '@supabase/supabase-js';

interface Auth {
    session: Session | null;
    supabaseClient: SupabaseClient;
    isAuthenticated: boolean;
    user: Session['user'] | null | undefined;
}

const useAuth = (): Auth => {
    const session = useSession();
    const supabaseClient = useSupabaseClient();
    const isAuthenticated = !!session;
    const user = session?.user;

    return { session, supabaseClient, isAuthenticated, user };
};

export default useAuth;