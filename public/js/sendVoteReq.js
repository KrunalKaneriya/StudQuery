const form = document.querySelectorAll(".upForm");
const downForm = document.querySelectorAll(".downForm");
const successDiv = document.getElementById("success-message");
const successText = document.getElementById("success-message-text");
const answerUpForm = document.querySelectorAll(".answerUpForm");
const answerDownForm = document.querySelectorAll(".answerDownForm");

const requestOptions = {
        method: 'PUT',
    };
    

// upForms.forEach(el => {
//     el.addEventListener("submit",function(e) {
//         e.preventDefault();
//         getVotes(this.elements.questionId.value,requestOptions,el);
//     })
// })


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
        let previousVote = parseInt(this.previousElementSibling.innerText);
        fetchVotes(this.elements.questionId.value,previousVote,el,'dec');
    })
})

answerUpForm.forEach(el => {
    el.addEventListener("submit",function(e) {
        e.preventDefault();
        let previousAnswerVote = parseInt(this.nextElementSibling.innerText);
        fetchAnswerVotes(this.elements.questionId.value,this.elements.answerId.value,previousAnswerVote,el,"inc");
    })
})

answerDownForm.forEach(el => {
    el.addEventListener("submit",function(e) {
        e.preventDefault();
        let previousAnswerVote = parseInt(this.previousElementSibling.innerText);
        fetchAnswerVotes(this.elements.questionId.value,this.elements.answerId.value,previousAnswerVote,el,"dec");
    })
})

//
function notificationWait() {
    setTimeout(addClassHidden,5000);

    function addClassHidden() {
        successDiv.classList.add("hidden");
    }
}

function fetchAnswerVotes(questionId,answerId,previousVote,el,voteStatus) {
    if(voteStatus==="inc") {
        fetch(`/question/${questionId}/answer/${answerId}/voteinc`,requestOptions)
            .then(res => {
                return res.json();
            })
            .then(data => {
                el.nextElementSibling.innerText = data.votes;
            })
    } else if(voteStatus==="dec") {
        fetch(`/question/${questionId}/answer/${answerId}/votedec`,requestOptions)
            .then(res => {
                return res.json();
            })
            .then(data => {
                el.previousElementSibling.innerText = data.votes;
            })
    }
}


// function getVotes (questionId,requestOptions,element) {
//     fetch(`/question/${questionId}/vote/inc`,requestOptions)
//         .then(res => {
//             return res.json();
//         })
//         .then(data => {
//             el.nextElementSibling.innerText = data.votes;
//         })
// }
// /************************************************************************************
//  * FUNCTION WHICH FETCH VOTES OF THE QUESTION WHEN USER CLICKS AND UPDATES THE VOTE *
//  ************************************************************************************/
function fetchVotes(questionId,previousVote,el,voteStatus) {
    if(voteStatus==="inc") {
        fetch(`/question/${questionId}/vote/inc`,requestOptions)
        .then(res => {
            return res.json();
        })
        .then(data => {
            el.nextElementSibling.innerText = data.votes;
            // if(data.votes === previousVote) {
            //     successText.innerText = "You Already Voted Up!!!";
            // } else {
            //     successText.innerText = "Your Vote is Updated";
            // }
        })
    } else if(voteStatus=="dec") {
        fetch(`/question/${questionId}/vote/dec`,requestOptions)
        .then(res => {
            return res.json();
        })
        .then(data => {
            el.previousElementSibling.innerText = data.votes;
            // if(data.votes == previousVote) {
            //     successText.innerText = "You Already Voted Up!!!";
            // } else {
            //     successText.innerText = "Your Vote is Updated";
            // };
        })
    }
}