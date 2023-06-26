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
	
	/*
	$.post("/api/predict", {
		act: submitarticle_act,
		v1: bbs_id,
		v2: $("input#ar_title").val(),
		v3: document.getElementById("ar_content").value,
		v4: $("select#ar_category").val(),
		v5: $("input#ar_keyword").val(),
		v6: $("input#ar_sessid").val(),
		v7: submitarticle_aid,
		v8: $("input#ar_check_notice:checked").val(),
		v9: $("input#ar_check_color_value").val(),
		v10: $("input#ar_check_book:checked").val(),
		v11: $("input#ar_check_view_unlogged:checked").val(),
		v12: $("input#ar_check_blind_unlogged:checked").val()
	},
	function (data, status) {
		_proc(data.rtn, data);

		$("button.btnsubmit").attr("disabled", false);
		$("button.btnsubmit").text("작성");
	}, "json");
	*/

	$("#input").keydown(function (e) {
		if (e.which == 13) {
			console.dir('enter');

			$.post("/api/predict",
				{
					input: $("#input").val(),
				},
				function (data, status) {
					console.dir(data);
				}
			);
		}
	});
});

// asdasdsadfgvds