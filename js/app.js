$(document).ready(function () {
	$.post("/api/request",
		{
			//
		},
		function (data, status) {
			console.dir(data);
			$(`#image`).attr("src", `/datasets/images/${data.src}`);
		}
	);

	$("#input").keydown(function (e) {
		if (e.which == 13) {
			$.post("/api/predict",
				{
					input: $("#input").val(),
				},
				function (data, status) {
					//
				}
			);
		}
	});
});