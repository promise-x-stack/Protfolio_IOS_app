import { useState } from "react";
import "./appleappstore.css"
import AppleAppSlider from "./AppleAppstoreSlider";
import Category from "./Category";
import AllProjects from "./Aplestorecomponents/Allprojects";
import EntertainmentCategory from "./Aplestorecomponents/Entertainment";
import ProductiveCategory from "./Aplestorecomponents/Productive";
import CommunityCategory from "./Aplestorecomponents/Community";
import PortfolioCategory from "./Aplestorecomponents/Portfolio";

function AppleAppStore(){

    const [Entertainment, setEntertainment]= useState(false)
    const [Portfolio, setPortfolio]= useState(false)
    const [Community, setCommunity]= useState(false)
    const [Productive, setProductive]= useState(false)

    const EntertainmentFunct=()=>{
        setEntertainment(Entertainment?false:true)
    }
    const PortfolioFunct=()=>{
        setPortfolio(Portfolio?false:true)
    }
    const CommunityFunct=()=>{
        setCommunity(Community?false:true)
    }
    const ProductiveFunct=()=>{
        setProductive(Productive?false:true)
    }

    return(
        <>
            <div className="app--store">
                <AppleAppSlider/>
                <Category
                    productive={ProductiveFunct}
                    community={CommunityFunct}
                    entertainment={EntertainmentFunct}
                    portfolio={PortfolioFunct}
                /> 
                <div className="container-p">
                    <div className="main-p-container">
                        { Productive && <ProductiveCategory/> }
                        { Community && <CommunityCategory/> }
                        { Entertainment && <EntertainmentCategory/> }
                        { Portfolio && <PortfolioCategory/> }
                        <AllProjects/>
                    </div>
                </div>
                
            </div>
        </>
    )

}

export default AppleAppStore