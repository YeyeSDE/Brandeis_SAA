$(document).ready(() => {
    let apiToken = $("#apiToken").text();
    $("#modal-button").click(() => {
      $(".modal-body").html("");
      $.get(`/api/events?apiToken=${apiToken}`, (results = {}) => {
        let data = results.data;
        if (!data || !data.events) return;
        data.events.forEach((event) => {
          //this append is not working
          $(".modal-body").append(
            `<div>
            <span style="font-weight:bold; font-size:17pt">
            ${event.title}
            </span>
            <div>
            ${event.description}
            </div>
            <button class="button1"
            data-id="${event._id}">Join Event</button>
            </div>`
          )
        });
      }).then(() => {
        addJoinButtonListener(apiToken);
      });
    });
  });

  // join event
  let addJoinButtonListener = (token) => {
    $(".join-button").click((event) => {
      let $button = $(event.target),
        eventId = $button.data("id");
      $.get(`/api/events/${eventId}/join?apiToken=${token}`, (results = {}) => {
        let data = results.data;
        console.log(data)
        console.log(data.success)
        if (data && data.success) {
          $button
            .text("Joined")
            .addClass("joined-button")
            .removeClass("join-button");
        } else {
          $button.text("Try again");
        }
      });
    });
  };
  

  
  
    