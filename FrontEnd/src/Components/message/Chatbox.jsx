

function Chatbox(props){

    return(

        <>
            <div className="chatbox-container">
                <div className="box-chat firstchat">
                    <p>Hello 🙂😎</p>
                </div>
                <div className="customer-text">
                    <p>hey 👋🏼</p>
                </div>
                <div className="box-chat">
                    <p>Am promise ndegwa</p>
                </div>
                <div className="box-chat">
                    <p>And i am a web developer and designer</p>
                </div>
                <div className="box-chat img-chat-box">
                    <div></div>
                </div>
                <div className="box-chat">
                    <p>Send me a short massage and your contacts bellow to make your, 🫵🏼 ideas came to life. 👇🏼👇🏼👇🏼👇🏼</p>
                </div>

                <div className="customer-text">
                    <p>{props.usertext}</p>
                </div>
            </div>
        </>

    )

}

export default Chatbox