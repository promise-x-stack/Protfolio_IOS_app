async function user() {
    await fetch("http://127.0.0.1:5000/message-user-data",{
        method:"POST",
        headers:{"Content-Type":"application/json"},
        body:JSON.stringify({
            "userMassege":"hello promise ndegwa"
        })
    })
    .then(Response=>console.log(Response))
    .catch(error=>console.log(error))
}

user()