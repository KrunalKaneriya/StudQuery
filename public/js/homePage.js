$(document).ready(function () {
    $(".answer-container").hide();
    toggle();
})

function toggle() {
    $(".reply-btn").click(function (e) {
        $(this).closest(".toggle-wrap").find(".answer-container").stop().slideToggle();
    })

}
