import { useState } from "react";
import PopUp from "./Notification";
import Chatbox from "./Chatbox";
import InputText from "./InputText";
import "./massage.css"

function MassagePage({ embedded = false }){
    const date = new Date().toLocaleDateString()

    const [Text,setText] = useState("")
    const [sendStatus, setSendStatus] = useState("")

    async function user(masege) {
        try {
            const response = await fetch("http://127.0.0.1:5000/message-user-data", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    userMassege: {
                        dateSent: date,
                        massege: masege,
                    },
                }),
            });
            const result = await response.json().catch(() => ({}));
            if (!response.ok) {
                throw new Error(result.error || "Could not send your message.");
            }
            setSendStatus("Your message was sent to the portfolio owner.");
        } catch (error) {
            setSendStatus(error.message || "Could not send your message.");
        }
    }

    const [popUp, setpopUp] = useState()
    function Sendmsg(){
        const text = document.getElementById("textInput")
        const message = text.value.trim()
        if (!message) {
            setSendStatus("Type a message before sending.")
            return
        }
        setText(message)
        setSendStatus("")
        setpopUp(true)
        
    }
    function displayPopUp(){
        setpopUp(false)
        user(Text)
    }

    return(
        <>
            <section id="mobileMassage" className={`msgp ${embedded ? "msgp-embedded" : ""}`}>
                <div className="container">
                    <Chatbox usertext={Text}/>
                    <InputText func={Sendmsg} icon={<i className="fas fa-paper-plane"></i>}/>
                    <p className="message-api-status" role="status" aria-live="polite">{sendStatus}</p>
                    {popUp && <PopUp func={displayPopUp}/>}
                </div>
            </section>
        </>
    )

}

export default MassagePage