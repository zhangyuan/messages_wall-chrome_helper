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
    var token = $("form input[name='token']").val();

    var host = $("form input[name='host']").val();
    var url = "http://" + host+ "/walls/retrieve";

    console.log(url);

    var payload = {
      token: token
    };

    $.post(url, payload, function(data){
     if (data.status === 0) {
      var title = data.wall.title;
       chrome.storage.sync.set({token: token, host: host, title: title}, function() {
         localStorage["messages_wall:token"] = token;
         localStorage["messages_wall:host"] = host;
         localStorage["messages_wall:title"] = title;
         console.log("sync: ", token, host, title);
       });
     }
    });
  });
});
