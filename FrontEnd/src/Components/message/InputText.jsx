
function InputText(props){

    return(
        <>
            <div className="input--container">
                <textarea name="input" id="textInput" placeholder="Massage"></textarea>
                <button onClick={props.func}>{props.icon}</button>
            </div>
        </>
    )

}

export default InputText