
import { components } from "../components";
import { hooks } from '../hooks';
import { Routes } from "../routes";
import Animation from "../components/Animation/NoCartData.json";
import Lottie from "lottie-react";

const NoCartData: React.FC = () => {
 
 
 
  const navigate = hooks.useNavigate();

  return (

    <>  
    <div style={{display:"flex", justifyContent:"center"}}>
      <Lottie animationData={Animation} style={{ width: 350, height: 350 }} />
    </div>
    <div style={{fontSize:"30px", fontWeight:"900", textAlign:"center", paddingTop:"100px"}}>
        Empty Cart
    </div>
  </>

  );
}

export default NoCartData;

