
function PopUp(props){

    return(
        <>
            <div className="popup--container">
                <div className="popup-card">
                    <h1>Contine to send your text</h1>
                    <button onClick={props.func}>Ok</button>
                </div>
            </div>
        </>
    )
}

export default PopUp