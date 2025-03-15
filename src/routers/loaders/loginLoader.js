//node modules
import { redirect } from "react-router-dom";

//custom modules
import { account } from "../../lib/appwrite";



const loginLoader = async() =>{
    try{
        await account.get();
    }
    catch(err) {
        console.log(`Error Getting User Session: ${err.message}`);
        return null;
    }

    return redirect('/');
};

export default loginLoader;