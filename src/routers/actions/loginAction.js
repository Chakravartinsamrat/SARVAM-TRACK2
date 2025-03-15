//modules
import {redirect} from 'react-router-dom';
//custom
import {account} from '../../lib/appwrite';




//handle login action

const loginAction = async({request}) => {
    //retrive shit
    const formData = await request.formData();
    //attempt to create a session uisng email and pussword from the foorm data
    try{
        await account.createEmailPasswordSession(
            formData.get('email'),
            formData.get('password')
        );

        //if suck sess login
        return redirect('/');

    }
    catch(err){
        return {
            message: err.message,
        };
    };
};

export default loginAction;