$(document).ready(function(){
  var token = localStorage["messages_wall:token"];
  var host = localStorage["messages_wall:host"];
  var title = localStorage["messages_wall:title"];
  var title_html = "<span class='wall_title'>" + title + "</span>";

  console.log(token, host);

  chrome.storage.onChanged.addListener(function(changes, areaName){
    if (changes.token) {
      console.log("token", changes.token.newValue);
      localStorage["messages_wall:token"] = token = changes.token.newValue;
    }

    if (changes.host) {
      console.log("host", changes.host.newValue);
      localStorage["messages_wall:host"] = host = changes.host.newValue;
    }

    if (changes.title) {
      console.log("host", changes.title.newValue);
      localStorage["messages_wall:title"] = host = changes.title.newValue;
    }

    location.reload();
  });

  if(!host)
    return;

  var uri = "http://" + host;

  var on_link = function(id) {
    return "<a class='create-message screen' href='#' data-id='"+ id + "'>上墙</a>";
  }

  var on_html = function(id) {
    return "<span class='create-message screen' href='#' data-id='"+ id +"'>上墙</span>";
  }

  var off_link = function(id) {
    return "<a class='delete-message screen' href='#' data-id='"+ id +"'>下墙</a>";
  }

  var off_html = function(id) {
    return "<span class='delete-message screen' href='#' data-id='"+ id +"'>下墙</span>";
  }

  var show_admin_speak_btn = function(){
      $("body").append("<a id='admin-sub-btn'class='admin-sub-msg' href='#'>发消息</a>");
  }

  var messages = {};
  var remote_messages = {};

  var find_message = function(id) {
    return messages[id];
  }

  var find_remote_message = function(id) {
    return remote_messages[id];
  }

  var refresh = function(message){
    console.log(message)
    var id = message.message_id;
    if(message.on) {
      $("a.create-message[data-id='"+id+"']").replaceWith(off_link(id))
    } else {
      $("a.delete-message[data-id='"+id+"']").replaceWith(on_link(id))
    }
  }

  var initialize_messages = function() {
    $(".message_item").each(function(index){
      var message = {};
      message.message_id = $(this).data("id");
      message.content = $(this).find(".wxMsg").text();
      message.remark_name = $(this).find(".user_info a.remark_name").text();
      message.original_avatar_url = $(this).find(".avatar img").attr("src");

      var image = new Image();
      image.src = message.original_avatar_url;
      image.onload = function() {
        message.avatar_data_url = getBase64Image(image);
      };

      messages[message.message_id] = message;

      if(find_remote_message(message.message_id)){
        message.on = true;
      }

      $(this).append(title_html);

      if(message.on) {
        $(this).append(off_link(message.message_id));
      } else {
        $(this).append(on_link(message.message_id));
      }
    });
  };

  var show_admin_sub_msg_view = function(){
      if($("div.admin-msg-view").length){
          return;
      }
      $.get(uri + "/messages/sticky.json?token="+token,function(data){
          var old_msg = data.messages[0];
          var admin_msg_view = "<div class='admin-msg-view'>" +
              "<p>主持人消息</p>"+
              ((old_msg != undefined && old_msg["content"]) ? "<div class='old-msg'><p id='"+old_msg.id+"' class='admin-old-msg'>主持人:"+old_msg.content+"</p><a href='#' class='del-admin-msg-btn'>X</a></div>" : "")
              +
              "<textarea id='admin-msg' placeholder='请输入消息,此消息将在消息墙置顶5分钟！'></textarea>"+
              "<button id='cancel-btn'>取消</button>" +
              "<button id='send-btn'>发送</button>"+
              "</div>";
          $("body").append(admin_msg_view);
      });
  };
  var delete_admin_msg = function (){
      var id = $("p.admin-old-msg").attr("id");
      var payload = {};
      payload._method = "delete";
      payload.token = token;
      $.post(uri + "/messages/" + 0, payload, function(data, status){
          if(data.status == 0){
              $("div.old-msg").remove();
          }
          if(data.status != 0){
              alert("网络异常！");
          }
      });
  };

  var remove_admin_sub_msg_view = function(){
      $("div.admin-msg-view").remove();
  };

  var sub_admin_msg = function(){
      var msg_str = $("#admin-msg").val();
      $("#admin-msg").val("");
      remove_admin_sub_msg_view();
      var message = {};
      message.message_id = 0;
      message.on = true;
      message.content = msg_str;
      message.remark_name = "主持人";
      var img = new Image();
      img.src = $("img.avatar").attr("src");
      message.original_avatar_url = $("img.avatar").attr("src");
      message.message_type = "sticky";
      img.onload = function() {
          message.avatar_data_url = getBase64Image(img);

      };
      var payload = {message: message};
      payload.token = token;
      $.post(uri + "/messages", payload, function(data, status){
          console.log(data);
      });
      return false;
  };

  var initialize_buttons = function() {
    $(document).on("click","a#admin-sub-btn",show_admin_sub_msg_view);
    $(document).on("click","button#cancel-btn",remove_admin_sub_msg_view);
    $(document).on("click","button#send-btn",sub_admin_msg);
    $(document).on("click","a.del-admin-msg-btn",delete_admin_msg);
    $(document).on("click", 'a.create-message', function(){
      var id = $(this).data("id");
      var message = find_message(id);
      var payload = {message: find_message(id)};
      payload.token = token;

      console.log(payload);

      $.post(uri + "/messages", payload, function(data, status){
        message.on = true;
        refresh(message);
        console.log(data);
      });
      return false;
    });

    $(document).on("click", 'a.delete-message', function(){
      var payload = {};
      var id= $(this).data("id");
      payload._method = "delete";
      payload.token = token;

      $.post(uri + "/messages/" + id, payload, function(data, status){
        var message = find_message(id);
        message.on = false;
        refresh(message);

      });
      return false;
    });
  };

  var initialize = function(){
    var ids = [];
    $(".message_item").each(function() {
      ids.push($(this).data('id'))
    });
      show_admin_speak_btn();
    var payload = {ids: ids};
    payload.token = token;
    if(host === "null" || $(".message_item").length === 0){
        return;
    }
    $.post(uri + "/messages/batch", payload, function(data){
        console.log(data);
      _.each(data.messages, function(message){
        remote_messages[message.message_id] = message;
      });

      initialize_messages();
    });
  }

  function getBase64Image(img) {
    var canvas = document.createElement("canvas");
    canvas.width = img.width;
    canvas.height = img.height;

    var ctx = canvas.getContext("2d");
    ctx.drawImage(img, 0, 0);
    var dataURL = canvas.toDataURL("image/png");

    return dataURL.replace(/^data:image\/(png|jpg);base64,/, "");
  }

  initialize();
  initialize_buttons();
});
