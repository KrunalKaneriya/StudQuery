const form = document.querySelectorAll(".upForm");
const downForm = document.querySelectorAll(".downForm");
const successDiv = document.getElementById("success-message");
const successText = document.getElementById("success-message-text");

form.forEach(el => {
    el.addEventListener("submit",function(e) {
        e.preventDefault();
        let previousVote = parseInt(this.nextElementSibling.innerText);
        fetchVotes(this.elements.questionId.value,previousVote,el,'inc');
    })
})

downForm.forEach(el => {
    el.addEventListener("submit",function(e) {
        e.preventDefault();
        let previousVotes = parseInt(this.previousElementSibling.innerText);
        fetchVotes(this.elements.questionId.value,previousVotes,el,'dec');
    })
})

const requestOptions = {
    method: 'PUT',
};

function notificationWait() {
    setTimeout(addClassHidden,5000);

    function addClassHidden() {
        successDiv.classList.add("hidden");
    }


}

/************************************************************************************
 * FUNCTION WHICH FETCH VOTES OF THE QUESTION WHEN USER CLICKS AND UPDATES THE VOTE *
 ************************************************************************************/
function fetchVotes(questionId,previousVote,el,voteStatus) {
    if(voteStatus=="inc") {
        fetch(`/question/${questionId}/vote/inc`,requestOptions)
        .then(res => {
            return res.json();
        })
        .then(data => {
            el.nextElementSibling.innerText = data.votes;
            if(data.votes == previousVote) {
                successText.innerText = "You Already Voted Up!!!";
            } else {
                successText.innerText = "Your Vote is Updated";
            }
            successDiv.classList.remove("hidden");
            notificationWait();
        })
        .catch(e => {
            window.location.href = "http://localhost:3000/";
        })
    } else if(voteStatus == "dec") {
        fetch(`/question/${questionId}/vote/dec`,requestOptions)
        .then(res => {
            return res.json();
        })
        .then(data => {
            el.previousElementSibling.innerText = data.votes;
            if(data.votes == previousVote) {
                successText.innerText = "You Already Voted Up!!!";
            } else {
                successText.innerText = "Your Vote is Updated";
            }
            successDiv.classList.remove("hidden");
            notificationWait();
        })
        .catch(e => {
            window.location.href = "http://localhost:3000/";
        })
    }
}