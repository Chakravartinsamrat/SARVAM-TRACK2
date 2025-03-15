//modules
import {Link, useNavigation, useNavigate, useLoaderData, useParams, useSubmit} from 'react-router-dom';
import { AnimatePresence } from 'framer-motion';
import PropTypes from 'prop-types';
//import Components
import { IconBtn } from "./Button";
import Avatar from './Avatar';
import Menu from './Menu';
import MenuItem from './MenuItem';
import {LinearProgress} from './Progress';
import Logo from './Logo';
//assets
// import {logoLight,logoDark} from '../assets/assets';

//hooks
import { useToggle } from '../hooks/useToggle';


//utils
import logout from '../utils/logout';
import deleteConversation from '../utils/deleteConversation';


//agar formdata nahi hai toh loading state dikha do
//agar formdata hai toh normal state dikha do
const TopAppBar = ({toggleSidebar}) => {
    const navigation = useNavigation();
    const navigate = useNavigate();


    const {conversations,user} = useLoaderData();


//params object contains URL parameters, incl conversationID
    const params = useParams();

    const submit = useSubmit();
    
    const [showMenu,setShowMenu] = useToggle();

    const isNormalLoad = navigation.state === 'loading' && !navigation.formData;
  return (
    <header className="relative flex justify-between items-center px-4 h-16">
        <div className="flex items-center gap-1">
            <IconBtn 
            icon='menu'
            title='Menu'
            classes='lg:hidden'
            onClick={toggleSidebar}
            />

            <Logo classes='lg:hidden'/>
            {/* <Link to='/' 
            className="min-w-max max-w-max h-[24px] lg:hidden">
                <img src={logoLight}
                width={133}
                height={24}
                alt="Synchat Logo" 
                className='dark:hidden'
                />
                <img src={logoDark}
                width={133}
                height={24}
                alt="Synchat Logo" 
                className='hidden dark:block'
                />
            </Link> */}
        </div>
        
        {params.conversationId &&(
            <IconBtn
            icon='delete'
            classes='ms-auto me-1 lg:hidden'
            onClick={() =>{
                
                const {title} = conversations.documents.find(
                    ({$id}) => params.conversationId === $id,
                );
                
                deleteConversation({
                    id:params.conversationId,
                    title,
                    submit
                })
            }}
            />
        )}


        <div className="menu-wrapper">
            <IconBtn onClick={setShowMenu}>
                <Avatar name={user.name}/>
            </IconBtn>
            <Menu classes={showMenu ? 'active':''}>
                <MenuItem labelText='Log out' onClick={() => logout(navigate)}/>
            </Menu>
        </div>
        <AnimatePresence>
        {isNormalLoad && <LinearProgress classes='absolute top-full left-0 right-0 z-10'/>}
        </AnimatePresence>
    </header>
  );
};


TopAppBar.propTypes={
    toggleSidebar:PropTypes.func,
};
export default TopAppBar