import { Navigate } from "react-router-dom";
import { useAuth } from "./AuthContext.tsx";

const PrivateRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const authContext = useAuth();

    if (!authContext) {
        return <Navigate to="/login" />;
    }

    const { isAuthenticated } = authContext;

    return isAuthenticated ? children : <Navigate to="/login" />;
};

export default PrivateRoute;

