import React from "react"
import { useState } from "react";
import PopUp from "./Notification";
import MassageNav from "./massageNav";
import Chatbox from "./Chatbox";
import InputText from "./InputText";
import "./massage.css"

function MassagePage(){
    const date = new Date().toLocaleDateString()

    const [Text,setText] = useState("")

    async function user(masege) {
        await fetch("http://127.0.0.1:5000/message-user-data",{
            method:"POST",
            headers:{"Content-Type":"application/json"},
            body:JSON.stringify({
                "userMassege":{
                    "dateSent":`${date}`,
                    "massege":`${masege}`
                }
            })
        })
        .then(Response=>Response.json())
        .then(data=>console.log(data))
    }

    const [popUp, setpopUp] = useState()
    function Sendmsg(){
        const text = document.getElementById("textInput")
        setText(text.value)
        setpopUp(true)
        /*
        user(Text)
        */
        
    }
    function displayPopUp(){
        setpopUp(false)
        user(Text)
    }

    return(
        <>
            <section id="mobileMassage" className="msgp">
                <div className="container">
                    <MassageNav backicon={<i className="fas fa-chevron-left"></i>} usericon="👩🏼‍🦰" homeicon={<i className="fas fa-house"></i>}/>
                    <Chatbox usertext={Text}/>
                    <InputText func={Sendmsg} icon={<i className="fas fa-paper-plane"></i>}/>
                    {popUp && <PopUp func={displayPopUp}/>}
                </div>
            </section>
        </>
    )

}

export default MassagePage