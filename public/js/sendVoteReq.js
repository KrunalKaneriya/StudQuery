const form = document.querySelectorAll(".upForm");
const downForm = document.querySelectorAll(".downForm");
const answerUpForm = document.querySelectorAll(".answerUpForm");
const answerDownForm = document.querySelectorAll(".answerDownForm");

const requestOptions = {
        method: "PUT"
};

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
        fetchAnswerVotes(this.elements.questionId.value,this.elements.answerId.value,"inc",el);
    })
})

answerDownForm.forEach(el => {
    el.addEventListener("submit",function(e) {
        e.preventDefault();
        fetchAnswerVotes(this.elements.questionId.value,this.elements.answerId.value,"dec",el);
    })
})


async function fetchAnswerVotes(questionId,answerId,voteStatus,el) {
    if(voteStatus==="inc") {
        await fetch(`/question/${questionId}/answer/${answerId}/voteinc`)
            .then(res => {
                return res.json();
            }).then(data => {
                el.nextElementSibling.innerText = data.votes;
            }).catch(
                console.log("Login First")
            )
    } else if (voteStatus === "dec") {
        await fetch(`/question/${questionId}/answer/${answerId}/votedec`)
            .then(res => {
                return res.json()
            }).then(data => {
                el.previousElementSibling.innerText = data.votes;
            }).catch(
                console.log("Login First")
            )
    }
}

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
        }).catch(
            console.log("Login First")
        )
    } else if(voteStatus=="dec") {
        fetch(`/question/${questionId}/vote/dec`,requestOptions)
        .then(res => {
            return res.json();
        })
        .then(data => {
            el.previousElementSibling.innerText = data.votes;
        }).catch(
            console.log("Login First")
        )
    }
}