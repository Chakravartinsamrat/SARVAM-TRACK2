import { useEffect, useState } from "react";
import { useNavigation } from "react-router-dom";

const userPromptPreloader =() =>{
    const navigation = useNavigation();

    const [promptPreloaderValue, setPromptPreloaderValue] =useState();

    useEffect(() =>{

        //if form data exists get the user prompt and update preloader value
        if (navigation.formData){
            setPromptPreloaderValue(navigation.formData.get('user_prompt'));

        //nhi toh reset preloader value top emptyy string
        }else{
            setPromptPreloaderValue('');
        }
    },[navigation]); //efeect tabhi kaam aayee jab navigation state change ho bkl 

    return {promptPreloaderValue};
};  

export {userPromptPreloader};