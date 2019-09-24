$(document).ready(function() {
  $('#uname').keyup(function(e) {
    let text = e.target.value;
    //console.log(text == '');
    if (text == '') {
      $('#chatsearch').html('');
    } else {
      let expression = $('#uname').val();
      //console.log(expression);
      $.ajax({
        type: 'GET',
        url: `/api/search/${expression}`,
        xhrFields: {
          withCredentials: true
        },
        success: function(response) {
          $('#chatsearch').html(response);
          setResponse();
        },
        error: function(xhr) {
          if (xhr.status == 401 || xhr.status == 500) {
            window.location = '/';
          }
        }
      });
    }
  });
  $('[chatid]').click(function(e) {
    e.preventDefault();
    let id = $(this).attr('chatid');
    document.location.href = `/chats/${id}`;
  });
  setInterval(refreshChats, 5000);
});

function refreshChats() {
  $.ajax({
    type: 'GET',
    url: 'api/refreshHomeChats',
    xhrFields: {
      withCredentials: true
    },
    success: function(response) {
      $('#chatbox').html(response);
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

function setResponse() {
  $('[userid]').click(function() {
    let id = $(this).attr('userid');
    let uname = $(this).attr('uname');
    $.ajax({
      type: 'GET',
      url: '/api/newChatQuery',
      data: {
        uname: uname,
        id: id
      },
      xhrFields: {
        withCredentials: true
      },
      dataType: 'json',
      success: function(response) {
        document.location.href = response.link;
        console.log(response.link);
      }
    });
  });
}
