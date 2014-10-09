$(document).ready(function(){
  var token = localStorage["messages_wall:token"];
  var host = localStorage["messages_wall:host"];
  var interval = localStorage["messages_wall:interval"];

  $("form input[name='token']").val(token);
  $("form input[name='host']").val(host);
  $("form input[name='interval']").val(interval);

  $("#sign_out").click(function(){
    chrome.storage.sync.set({token: null});
    chrome.storage.sync.set({host: null});
    chrome.storage.sync.set({title: null});
    chrome.storage.sync.set({interval: null});

    localStorage["messages_wall:token"] = "";
    localStorage["messages_wall:host"] = "";
    localStorage["messages_wall:title"] = "";
    localStorage["messages_wall:interval"] = "";

    $(".notice").text("已经退出");
    console.log("sync: ", token, host, title);
  });

  $("#sign_in").submit(function(event){
    event.preventDefault();
    var token = $("form input[name='token']").val();

    var host = $("form input[name='host']").val();
    var url = "http://" + host+ "/walls/retrieve";
    var interval = $("form input[name='interval']").val();

    console.log(url);

    var payload = {
      token: token
    };

    $.post(url, payload, function(data){
     if (data.status === 0) {
      var title = data.wall.title;
       chrome.storage.sync.set({token: token, host: host, title: title, interval: interval}, function() {
         localStorage["messages_wall:token"] = token;
         localStorage["messages_wall:host"] = host;
         localStorage["messages_wall:title"] = title;
         localStorage["messages_wall:interval"] = interval;
         $(".notice").text("登录成功");
         console.log("sync: ", token, host, title, interval);
       });
     }
    });
  });
});
