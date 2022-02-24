$(document).ready(function () {
	$(".answer-container").hide();
	toggle();
});

//Function to toggle The Answer Input Area
function toggle() {
	$(".reply-btn").click(function (e) {
		$(this).closest(".toggle-wrap").find(".answer-container").stop().slideToggle();
	});
}
