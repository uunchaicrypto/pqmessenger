import { createContext,useEffect,useState,useContext } from "react";
const AuthContext = createContext();
export const AuthContextProvider =({children}) => {
    const [session, setsession] = useState(undefined)
    return (
        <AuthContext.Provider value={{session}}>
            {children}
        </AuthContext.Provider>
    )
  
}
export const UserAuth =() => {
    return useContext(AuthContext)
  
}
