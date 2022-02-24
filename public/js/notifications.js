const closeButton = document.querySelectorAll(".close-btn");
const messageDiv = document.querySelectorAll(".message");

for (const close of closeButton) {

	close.addEventListener("click", function () {
		for (let msg of messageDiv) {
			msg.classList.add("hidden");
		}

	});
}


setTimeout(function () {

	for (let msgDiv of messageDiv) {
		msgDiv.classList.add("hidden");
	}

}, 3000);
