var EventsApi = {
  findEvents: (city, callback) => {
    fetch(`/api/events/${city}`)
      .then(data => data.json())
      .then(callback);
  }
};

var UI = {
  getCityField: () => $("#city"),
  getEventsList: () => $("#events"),
  getSubmitButton: () => $("#submit"),
  getEventPreview: () => $("#eventPreview"),
  disableSubmit: (text = "Find events") => {
    let submitButton = UI.getSubmitButton();
    submitButton.attr("disabled", true);
    submitButton.text(text);
  },
  enableSubmit: () => {
    let submitButton = UI.getSubmitButton();
    submitButton.attr("disabled", false);
    submitButton.text("Find events");
  },
  getForm: () => $("form"),
  toggleLoading: () => {
    const loadingContent =
      '<span class="spinner-grow spinner-grow-sm" role="status" aria-hidden="true"></span> Loading...';
    UI.getSubmitButton().html(loadingContent);
  },
  validate: () => {
    const city = UI.getCityField().val();

    return $.trim(city);
  },
  buildEventHtml: event =>
    $(
      `
    <div class="card" style="width: 18rem;">
      <img src="${event.logo.url}" class="card-img-top" alt="${event.name}">

      <div class="card-body">
        <h5 class="card-title">${event.name.text}</h5>
      </div>
      <div class="card-footer">
        <a
          href="#"
          class="btn btn-primary"
          data-toggle="modal"
          data-target="#eventPreview"
          data-title="${escape(event.name.html)}"
          data-description="${escape(event.description.html)}"
          data-url="${escape(event.url)}"
        >
          More details
        </a>
      </div>
    </div>
  `
    ),
  bindModalAction: () => {
    UI.getEventPreview().on("show.bs.modal", function(event) {
      var button = $(event.relatedTarget); // Button that triggered the modal
      var title = unescape(button.data("title")); // Extract info from data-* attributes
      var description = unescape(button.data("description")); // Extract info from data-* attributes
      var url = unescape(button.data("url")); // Extract info from data-* attributes
      var modal = $(this);

      modal.find(".modal-title").html(title);
      modal.find(".modal-body").html(description);
      modal.find(".modal-footer #eventUrl").prop("href", url);
    });
  },
  bindFormActions: () => {
    const validate = e => {
      var code = e.keyCode ? e.keyCode : e.which;
      if (code == 13) {
        return;
      }

      if (UI.validate()) {
        UI.enableSubmit();
      } else {
        UI.disableSubmit();
      }
    };

    UI.getCityField().on("change keyup paste focus", validate);
    UI.getForm().on("submit", event => {
      event.preventDefault();

      const city = $.trim(UI.getCityField().val());

      UI.disableSubmit();
      UI.toggleLoading();
      UI.getEventsList().html("");

      EventsApi.findEvents(city, events => {
        UI.enableSubmit();
        events.forEach(suggestion => {
          UI.getEventsList().append(UI.buildEventHtml(suggestion));
        });
      });
    });
  },
  init: () => {
    UI.bindModalAction();
    UI.bindFormActions();
    UI.getCityField().focus();
  }
};

$(document).ready(() => {
  UI.init();
});
