$(document).ready(function () {
	$("#edit-button-wrapper").click(function () {
		$("#edit-button").fadeOut("slow");
		$("#delete-button-wrapper").fadeOut("slow");
		$("#username").prop("disabled", false);
		$("#alias").prop("disabled", false);
		$("#email").prop("disabled", false);
		$("#age").prop("disabled", false);
		$("#city").prop("disabled", false);
		$("#studyingin").prop("disabled", false);
		$("#description").prop("disabled", false);
	});
});

let modal = document.getElementById("my-modal");
let openBtn = document.getElementById("open-btn");
let deleteBtn = document.getElementById("delete-btn");
let cancelBtn = document.getElementById("cancel-btn");

openBtn.addEventListener("click", function () {
	modal.classList.remove("hidden");
});

cancelBtn.addEventListener("click", function () {
	modal.classList.add("hidden");
});
