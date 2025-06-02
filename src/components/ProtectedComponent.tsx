import React, { ReactNode, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Routes } from '../routes';

interface ProtectedComponentProps {
    children: ReactNode;
}

const ProtectedComponent: React.FC<ProtectedComponentProps> = ({ children }) => {
    const navigate = useNavigate();
    const [checkedAuth, setCheckedAuth] = useState(false);
    const [authorized, setAuthorized] = useState(false);
    const c_id = localStorage.getItem('c_id');
    const area_id = localStorage.getItem('cityId');
    useEffect(() => {
        const isInvalid =
            !c_id || c_id === "null" || c_id === "" || c_id === "0" ||
            !area_id || area_id === "null" || area_id === "" || area_id === "0";
        if (isInvalid) {
            navigate(Routes.SignIn, { replace: true });
            setAuthorized(false);
        } else {
            setAuthorized(true);
        }
        setCheckedAuth(true);
    }, [navigate]);

    if (!checkedAuth) {
        return null;
    }

    if (!authorized) {

        return null;
    }
    return <>{children}</>;
};

export default ProtectedComponent;
