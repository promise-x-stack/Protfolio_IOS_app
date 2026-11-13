import React, { useState } from "react";
import "./appleappstore.css"
import AppleAppSlider from "./AppleAppstoreSlider";
import Category from "./Category";
import AllProjects from "./Aplestorecomponents/Allprojects";
import EntertainmentCategory from "./Aplestorecomponents/Entertainment";
import ProductiveCategory from "./Aplestorecomponents/Productive";
import CommunityCategory from "./Aplestorecomponents/Community";
import PortfolioCategory from "./Aplestorecomponents/Portfolio";

function AppleAppStore(prop){

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
            <div className="mail-container app--store">
                {
                window.innerWidth >= 1200 && <header className="header-c">
                    <div className="do-container">
                        <div onClick={prop.func} className="do red"></div>
                        <div className="do yellow"></div>
                        <div className="do green"></div>
                    </div>
                    <h2 className="h2--h"><i className="fas fa-apple-alt"></i> Projects</h2>
                </header>
                }   
                {
                    window.innerWidth < 1200 && <div className="new--nav-b">
                        <button onClick={prop.func} className="nav-btn back-btn">
                            <i className="fas fa-chevron-left"></i>
                        </button>
                        <h2 className="h2--h"><i className="fas fa-apple-alt"></i> Projects</h2>
                        </div>
                }
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