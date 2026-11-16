
import { Link } from "react-router-dom";

function MassageNav(props){

    return(

        <>
            <div className="massg-container">
                <button>{props.backicon}</button>
                <div>
                    <div className="img">{props.usericon}</div>
                    <p>Promise_Dev</p>
                </div>
                <button>{props.homeicon}</button>
            </div>
        </>

    )

}

export default MassageNav