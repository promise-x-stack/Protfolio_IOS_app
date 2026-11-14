import React from "react";
import { useState, useEffect} from "react";
import "./Apple.css"

const date = new Date().toLocaleDateString()

function Applemail(props){
    const [sent, setsent] = useState(false)
    const [inbox, setinbox] = useState(true)
    const [draft, setdraft] = useState(false)
    const [trasher, settrasher] = useState(false)

    function Inboxbox(){
        setinbox(true)
        setsent(false)
        setdraft(false)
        settrasher(false)
    }
    function sentt(){
        setsent(true)
        setinbox(false)
        setdraft(false)
        settrasher(false)
    }
    function Drafter(){
        setdraft(true)
        setsent(false)
        setinbox(false)
        settrasher(false)
    }
    function Ttrash(){
        settrasher(true)
        setsent(false)
        setinbox(false)
        setdraft(false)
    }

    const [sented, setsented] = useState(false)
    const [apple, setapple] = useState(false)
    const [pro, setpro] = useState(false)

    function applef(){
        setapple(true)
        setpro(false)
        setsented(false)
    }
    function promis(){
        setapple(false)
        setpro(true)
        setsented(false)
    }
    function sendder(){
        setsented(true)
        setapple(false)
        setpro(false)
    }

    const [tab, settab] = useState(true)


    function sendtext(){
        settab(false)
    }
    const [massaging, setmassaging] = useState()
    const [from, setfrom] = useState()
    const [subject, setsubject] = useState()
    const [count, setcount] = useState(0)

    function unsend(){
        const Subject = document.getElementById("Subject");
        const From = document.getElementById("From");
        const message = document.getElementById("message");

        const list = [];

        function Data(sub,frm,msg){
            setmassaging(e=>e=msg)
            setfrom(e=>e=frm)
            setsubject(e=>e=sub)
            
            const EmploeyerData={
                "Sender":frm,
                "Subject":sub,
                "Message":msg,
                "DateSent":date
            }
            list.push(EmploeyerData)
            //console.log(list)

            settab(true)
            
            async function Mail(){
                await fetch("http://127.0.0.1:5000/mail-user-data",{
                    method:"POST",
                    headers:{"Content-Type":"application/json"},
                    body: JSON.stringify({"email":EmploeyerData})
                })
            }
            Mail()
        }
        if(Subject.value === "" && From.value === "" && message.value === ""){
            Subject.placeholder="Mail has no  Subject";
            From.placeholder="No senders addres";
            message.placeholder="Mail has no Massage";
        }else if(Subject.value === ""){
            Subject.placeholder="Mail has no  Subject";
        }else if(From.value === ""){
            From.placeholder="No senders addres";
        }else if(message.value === ""){
            message.placeholder ="Mail has no Massage";
        }else{
            const subje = Subject.value;
            const fro = From.value;
            const msge = message.value;
            Data(subje, fro, msge)
            setcount(count+1)
        }
        
        
    }

    function ElementCard(props){
        return(
            <>
                <div className="element-card">
                    <div className="header">
                        <h4>{props.username}</h4>
                        <p>{props.date}</p>
                    </div>
                    <div className="card-text-container">
                        <h6>{props.tittle}</h6>
                        <p>{props.text}</p>
                    </div>
                </div>
            </>
        )
    }

    function Card(props){
        return(
            <>
             <div className="applemail-card">
                <div className="header--card"><h6>{props.header}</h6></div>
                <div className="container--card">

                    {inbox &&<div className="inbox">

                        <div onClick={applef}>
                            <ElementCard
                                username="Apple ID"
                                date="Tue, 8:30 AM"
                                tittle="Your Apple ID was used to sighn in"
                                text="A new device was used to sihn in into your Apple ID. If this wasent..."
                            />
                        </div>

                        <div onClick={promis}>
                            <ElementCard
                                username="Promise_X"
                                date="Thu, 9:30 AM"
                                tittle="Websight Project"
                                text="Check out this new prject before it's to late..."
                            />
                        </div>

                    </div>}

                    {sent && <div className="sent--text">

                        {count >= 1 && <div onClick={sendder}>
                            <ElementCard
                                username="PromiseDev@gmail.com"
                                date={date}
                                tittle={subject}
                                text={massaging}
                            />
                        </div>}

                    </div>}

                    {draft && <div className="sent--text">

                        <div className="draft--d">
                            <i className="fas fa-file-alt"></i>
                            <p>There is no draft</p>
                        </div>

                    </div>}

                    {trasher && <div className="sent--text">

                        <div className="draft--d">
                            <i className="fas fa-trash-alt"></i>
                            <p>There is no Trash</p>
                        </div>

                    </div>}
                    
                </div>
             </div>
            </>
        )
    }

    function Mailtext(props){

        return(
            <>
                <div className="mail--container">
                    <div className="text--header">
                        <h1>{props.header}</h1>
                        <div>
                            <span><label>From:</label><p>{props.from}</p></span>
                            <span><label>To:</label><p>{props.to}</p></span>
                            <span><label>Date:</label><p>{props.date}</p></span>
                        </div>
                    </div>
                    <div className="text--body">
                        <p>{props.text}</p>
                    </div>
                    <div className="text--footer">
                        <p><i className="fas fa-reply-all"></i> Reply, Fowarded, Achive (mac OS style)</p>
                    </div>
                </div>
            </>
        )

    }

    

    return(

        <>
         
        <div className="pop--up-container">
            <div className="mail-container">
                <header>
                    <div className="dot-container">
                        <div onClick={props.func} className="dot red"></div>
                        <div className="dot yellow"></div>
                        <div className="dot green"></div>
                    </div>

                    <div className="window-title">
                        <i className="fas fa-envelope-open-text"></i> Mail
                    </div>

                    {tab == false && <div className="submit--btn">

                        <div className="container--option">
                            <h3>Aa</h3>
                            <h3>😊</h3>
                        </div>
                        <button onClick={unsend} type="submit"><i className="fas fa-paper-plane"></i></button>
                    </div>}

                </header>

                {tab ? <div className="m">
                <nav>
                    <button onClick={sendtext}><i className="fas fa-pen-fancy"></i> New Message</button>

                    <div>
                        <i className="fas fa-search"></i> <span>Search Mail</span>
                    </div>
                </nav>

                <section className="main--section">

                    <aside>
                        <div>
                            <ul>
                                <li><button onClick={Inboxbox}><div><i className="fas fa-inbox"></i><p>Inbox</p></div><span>2</span></button></li>
                                <li><button onClick={sentt}><div><i className="fas fa-paper-plane"></i><p>Sent</p></div><span>{count}</span></button></li>
                                <li><button onClick={Drafter}><div><i className="fas fa-file-alt"></i><p>Draft</p></div><span>0</span></button></li>
                                <li><button onClick={Ttrash}><div><i className="fas fa-trash-alt"></i><p>Trash</p></div><span>0</span></button></li>
                            </ul>
                        </div>
                    </aside>

                    <div className="email--msg">
                        {inbox && <Card header="Inbox"/>}
                        {sent && <Card header="Sent"/>}
                        {draft && <Card header="Draft"/>}
                        {trasher && <Card header="Trash"/>}
                    </div>

                    <div className="email--msg-text">
                        {apple && <Mailtext
                            header="Your Apple ID was used to sighn in"
                            from="Apple ID <apple@id.apple.com>"
                            to="user@macbook.com"
                            date="Tue, 8:30 AM"
                            text="Some one tryde to use your macbook acount to log in"
                        />}
                        {pro && <Mailtext
                            header="Websight Project"
                            from="promise0X@gmail.com"
                            to="user@macbook.com"
                            date="Thu, 9:30 AM"
                            text="Check out this new prject before it's to late and the project is unpublished. https://github.com/Promise254"
                        />}
                        {sented && <Mailtext
                            header={subject}
                            from={from}
                            to="PromiseDev@gmail.com"
                            date={date}
                            text={massaging}
                        />}
                    </div>

                </section></div>
                :
                <section className="text--composer">
                    <div className="text--composer-container">
                            <form>
                                <div className="form--input-div">
                                    <label>To: </label>
                                    <input type="text" value="promiseDev@gmail.com"/>
                                </div>

                                <div className="form--input-div">
                                    <label>Cc: </label>
                                    <input type="text" value="Carbon copy"/>
                                </div>

                                <div className="form--input-div">
                                    <label>Subject: </label>
                                    <input type="text" id="Subject"/>
                                </div>

                                <div className="form--input-div">
                                    <label>From: </label>
                                    <input type="text" id="From"/>
                                </div>
                                
                                <div className="form--input-div text">
                                    <textarea placeholder="Massege" id="message"></textarea>
                                </div>
                            </form>
                    </div>
                </section>}

            </div>
        </div>
        
        </>

    )
}

export default Applemail