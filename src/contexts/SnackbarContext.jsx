import PropTypes from "prop-types";
import { createContext, useState, useRef, useCallback,useMemo } from "react";
import Snackbar from "../components/Snackbar";
const initialCtxValue = {
    snackbar: {
        open: false,
        message:'',
        type: 'info',
    },
    showSnackBar: ({message, type = 'info', timeOut = 5000}) =>{},
    hideSnackBar: () =>{},
};

export const SnackbarContext = createContext(initialCtxValue);

const SnackbarProvider  = ({children}) =>{
    const [snackbar, setSnackbar] = useState({
        open: false,
        message: '',
        type: 'info',
    });
    const timeoutRef = useRef();

    const showSnackBar = useCallback(({message, type = 'info', timeOut = 5000 }) =>{
        if (timeoutRef.current) clearTimeout(timeoutRef.current);

        setSnackbar({open:true, message, type});

        timeoutRef.current = setTimeout(() =>{setSnackbar((prev)=> {
            return { ...prev, open: false };
        });
        }, timeOut);
    },[]);

    //hide snackBar manually if needed
    const hideSnackBar = useCallback(() => {
        if (timeoutRef.current) clearTimeout(timeoutRef.current);
        setSnackbar({open:false, message:'', type:'info'});
    },[]);

    //preventing re renders 
    const contextValue =  useMemo(() =>{
        return {showSnackBar, hideSnackBar};
    },[showSnackBar, hideSnackBar]);

    return (
        <SnackbarContext.Provider value = {contextValue}>
            {children}
            <Snackbar snackbar={snackbar} />
        </SnackbarContext.Provider>
    )
};

SnackbarProvider.propTypes = {
    children : PropTypes.any,
};

export default SnackbarProvider;