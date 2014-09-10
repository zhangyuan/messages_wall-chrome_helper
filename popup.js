$(document).ready(function(){
  var token = localStorage["messages_wall:token"];
  var host = localStorage["messages_wall:host"];

  $("form input[name='token']").val(token);
  $("form input[name='host']").val(host);

  $("#sign_out").click(function(){
    chrome.storage.sync.set({token: null});
    chrome.storage.sync.set({host: null});
  });

  $("#sign_in").submit(function(event){
    event.preventDefault();

    var payload = {
      token: $("form input[name='token']").val()
    };

    var host = $("form input[name='host']").val();
    var url = "http://" + host + "/sessions";

    console.log(payload);
    console.log(url);

    $.post(url, payload, function(data){
      if (data.status === 0) {
        chrome.storage.sync.set({token: data.token, host: host}, function() {
          localStorage["messages_wall:token"] = data.token;
          localStorage["messages_wall:host"] = host;
          console.log("sync: ", data.token, host);
        });
      }
    });
  });
});
