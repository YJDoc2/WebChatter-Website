$(document).ready(function () {

    otherUuid = $(location).attr("href").split('/').pop();
    $("#sendBtn").click(function (e) {
        e.preventDefault();
        let otherUserName = $('#title').find('h3').text();
        let message = $("#msg").val();
        if (message !== '') {
            let data = {
                otherUuid: otherUuid,
                otherUserName: otherUserName,
                msg: message
            };
            $.ajax({
                type: "POST",
                url: "/api/createNewChat",
                xhrFields: {
                    withCredentials: true
                },
                data: data,
                dataType: "json",
                success: function (response) {
                    window.location.href = response.link;

                }
            });
        }
    });

});