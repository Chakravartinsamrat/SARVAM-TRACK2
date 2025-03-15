
import PropTypes from "prop-types";
//COMPONENTS
import UserPrompt from "./UserPrompt";
import AiResponse from "./AiResponse";
import Skeleton from '../components/Skeleton';

const PromptPreloader = ({promptValue}) => {
  return (
    <div className="max-w-[700px] mx-auto">
        <UserPrompt text={promptValue}/>

        <AiResponse> 
            <Skeleton/>
        </AiResponse>
    </div>
  )
}


PromptPreloader.propTyes={
    promptValue: PropTypes.string,
};
export default PromptPreloader;