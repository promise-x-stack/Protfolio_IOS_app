
import { Link } from "react-router-dom";

function MassageNav(props){

    return(

        <>
            <div className="massg-container">
                <Link to={"/"}><button>{props.backicon}</button></Link>
                <div>
                    <div className="img">{props.usericon}</div>
                    <p>Promise_Dev</p>
                </div>
                <Link to={"/"}><button>{props.homeicon}</button></Link>
            </div>
        </>

    )

}

export default MassageNav