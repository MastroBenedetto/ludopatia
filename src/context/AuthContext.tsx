import React, {createContext, useContext, useEffect, useMemo,useState} from "react";
// Credenziali FINTE (hard-coded) e token finto
const DEMO_EMAIL = "demo@example.com";
const DEMO_PASSWORD = "password123";
const FAKE_TOKEN = "fake.jwt.token.12345";

type AuthContextType = {
    token: string | null;
    isAuthenticated: boolean;
    login: (email: string, password: string) => Promise<{ok: boolean; error?: string }>;
    logout:() => void;
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({children }: { children: React.ReactNode}){

    const [token, setToken] = useState<string | null>(null);

    useEffect(() =>{
        const saved = localStorage.getItem("auth_token");
        if(saved) setToken(saved);
    }, []);

    useEffect(() => {
        if (token) localStorage.setItem("auth_token", token);
        else localStorage.removeItem("auth_token");
    }, [token]);


    const login = async(email: string, password: string) =>{
            await new Promise(r => setTimeout(r, 500));
            if(email === DEMO_EMAIL && password === DEMO_PASSWORD){
                setToken(FAKE_TOKEN);
                return {ok: true};
            }    
        return {ok: false, error:"Credenziali non valide"};
    };

    const logout = () => setToken(null);

    const value = useMemo<AuthContextType>(() => ({
        token,
        isAuthenticated: !!token,
        login,
        logout
    }), [token]);

    return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth deve essere usato dentro <AuthProvider>");
  return ctx;
}