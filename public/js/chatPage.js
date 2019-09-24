$(document).ready(function() {
  $('#sendBtn').click(function(e) {
    e.preventDefault();
    let msg = $('#msg').val();
    if (msg == '') {
      return;
    } else {
      let data = {
        msg: msg,
        id: $(location)
          .attr('href')
          .split('/')
          .pop()
        //otherName: $('#title').find('h3').text()
      };
      $.ajax({
        type: 'POST',
        url: '/update/chatAddMsg',
        data: data,
        dataType: 'json',
        success: function(response) {
          if (response.success) {
            $('#chatHistory').append(`<div class="textBox">
                        <span class=speech-bubble-self>${msg}</span>
                      </div>`);
            $('#msg').val('');
          }
        }
      });
    }
  });
  console.log('chatsjsCheck');
  setInterval(refreshChat, 1000);
});

function refreshChat() {
  let id = $(location)
    .attr('href')
    .split('/')
    .pop();
  let url = `/api/refreshChat/${id}`;

  $.ajax({
    type: 'GET',
    url: url,
    xhrFields: {
      withCredentials: true
    },
    success: function(response) {
      //console.log('success in receive');
      $('#chatHistory').html(response);
      var objDiv = document.querySelector('.chat-history');
      objDiv.scrollTop = objDiv.scrollHeight;
    },
    error: err => {
      console.log(err);
    }
  }).always(() => {
    $('[chatid]').click(function(e) {
      e.preventDefault();
      let id = $(this).attr('chatid');
      document.location.href = `/chats/${id}`;
    });
  });
}
