import React from "react"
import { useEffect, useState } from "react";
import "./projects.css"


function EntertainmentCategory(){
    const [card, setcard] = useState("empty")
    
        useEffect(()=>{
            async function dataCard(){
                await fetch("http://127.0.0.1:5000/api/products/entertainment")
                .then(data=>data.json())
                .then(data=>setcard(data))
            }
            dataCard()
        },[])
    
        const mydata = Array.isArray(card)

    return(
        <>
        <div className="All-p-container">
            <div className="lable">
                <h2>Entertainment</h2>
            </div>
            
            <div className="product--container-c">
                {
                    mydata ? card.map((e) => (
                        <div key={e.id} className="app-card">
                            <div className="app-icon">
                                <span>{e.logo}</span>
                            </div>
                            <div className="app-details">
                                <div className="app-name">{e.projectName}</div>
                                <div className="app-category">{e.category}</div>
                                <div className="rating">{e.ratings}</div>
                            </div>
                            <a target="blank" href={e.link}><button className="download-btn">VIEW</button></a>
                        </div>
                    )) : <div className="app-data-details">
                            <div className="app-data-name"><h2>Data Not Found</h2></div>
                            <div className="app-data-category"><h3>data-type: Array</h3></div>
                        </div>
                }
            </div>

        </div>
        
        </>
    )
}

export default EntertainmentCategory