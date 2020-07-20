(() => {
  // Ensures we can safely retry failed requests and add default params
  class ApiCircuitBreaker {
    constructor(timeout = 5000, failureThreshold = 5, retryTimePeriod = 500) {
      // We start in a closed state hoping that everything is fine
      this.state = "CLOSED";
      // Number of failures we receive from the depended service before we change the state to 'OPEN'
      this.failureThreshold = failureThreshold;
      // Timeout for the API request.
      this.timeout = timeout;
      // Time period after which a fresh request be made to the dependent
      // service to check if service is up.
      this.retryTimePeriod = retryTimePeriod;
      this.lastFailureTime = null;
      this.failureCount = 0;
    }

    async call(url, params = {}) {
      // Determine the current state of the circuit.
      this.setState();
      switch (this.state) {
        case "OPEN":
          // return  cached response if no the circuit is in OPEN state
          return { data: "this is stale response" };
        // Make the API request if the circuit is not OPEN
        case "HALF-OPEN":
        case "CLOSED":
          try {
            const response = await fetch(
              url,
              Object.assign(
                {
                  timeout: this.timeout,
                  method: "GET",
                  headers: { "x-user-id": UserApi.getUserId() }
                },
                params
              )
            );

            this.reset();
            return response.json();
          } catch (err) {
            this.recordFailure();
            throw new Error(err);
          }
        default:
          console.log("This state should never be reached");
          return "unexpected state in the state machine";
      }
    }

    reset() {
      this.failureCount = 0;
      this.lastFailureTime = null;
      this.state = "CLOSED";
    }

    setState() {
      if (this.failureCount > this.failureThreshold) {
        if (Date.now() - this.lastFailureTime > this.retryTimePeriod) {
          this.state = "HALF-OPEN";
        } else {
          this.state = "OPEN";
        }
      } else {
        this.state = "CLOSED";
      }
    }

    recordFailure() {
      this.failureCount += 1;
      this.lastFailureTime = Date.now();
    }
  }

  // Simulate a user ID as we don't have sign up
  // It will be persisted as long as the user doesn't their browser storage
  const UserApi = {
    getUserId: () => localStorage.getItem("userId"),
    createUserId: () => localStorage.setItem("userId", Date.now())
  };

  // Abstracts communication with the API
  // Allows us to search for events and manage favorites
  const PlacesApi = {
    findPlaces: async city =>
      new ApiCircuitBreaker().call(`/api/places/${city}`),
    createFavorite: async id =>
      new ApiCircuitBreaker().call(`/api/places/${id}/favorites`, {
        method: "POST"
      }),
    deleteFavorite: async id =>
      new ApiCircuitBreaker().call(`/api/places/${id}/favorites`, {
        method: "DELETE"
      }),
    getPlaceFavorites: async id =>
      new ApiCircuitBreaker().call(`/api/places/${id}/favorites`)
  };

  // Abstracts UI changes
  const UI = {
    getUrlParameter: name => {
      name = name.replace(/[\[]/, "\\[").replace(/[\]]/, "\\]");
      var regex = new RegExp("[\\?&]" + name + "=([^&#]*)");
      var results = regex.exec(location.search);
      return results === null
        ? ""
        : decodeURIComponent(results[1].replace(/\+/g, " "));
    },
    getCityUrlParameter: () => UI.getUrlParameter("city"),
    getCityField: () => $("#city"),
    getPlacesList: () => $("#places"),
    getSubmitButton: () => $("#submit"),
    getPlacePreview: () => $("#placePreview"),
    disableSubmit: (text = "Find places") => {
      let submitButton = UI.getSubmitButton();
      submitButton.attr("disabled", true);
      submitButton.text(text);
    },
    enableSubmit: () => {
      let submitButton = UI.getSubmitButton();
      submitButton.attr("disabled", false);
      submitButton.text("Find seafood");
    },
    getForm: () => $("form"),
    getLoadingHtml: (includeText = true) =>
      `<span class="spinner-grow spinner-grow-sm" role="status" aria-hidden="true"></span>${
        includeText ? " Loading..." : ""
      }`,
    toggleLoading: () => {
      const loadingContent = UI.getLoadingHtml(true);
      UI.getSubmitButton().html(loadingContent);
    },
    validate: () => {
      const city = UI.getCityField().val();

      return $.trim(city);
    },
    buildPlaceHtml: place =>
      $(
        `
    <div class="card" style="width: 18rem;">
      <img
        src="${place.image_url}"
        class="card-img-top"
        alt="${place.name}"
      />

      <div class="card-body">
        <h5 class="card-title">${place.name}</h5>
      </div>
      <div class="card-footer">
          <a
          href="#"
          class="btn btn-primary"
          data-toggle="modal"
          data-target="#placePreview"
          data-title="${escape(place.name)}"
          data-description="${escape(place.phone)}"
          data-url="${escape(place.url)}"
          data-id="${place.id}"
        >
          More details
        </a>
      </div>
    </div>`
      ),
    getModal: () => $("#modal"),
    updateModalActions: async (placeFavorites, id, block = false) => {
      const hasFavorited = placeFavorites.results.find(
        event => event.user_id.toString() === UserApi.getUserId()
      );

      const modal = UI.getModal();
      const modalActionsContainer = modal.find(".modal-footer");
      modalActionsContainer.show();
      const favoriteActionButton = modalActionsContainer.find(
        "#subscribeButton"
      );

      // Update styles
      favoriteActionButton
        .find("#subscribedButtonContent")
        .attr("class", `${hasFavorited ? "favorited" : ""}`);

      favoriteActionButton.attr(
        "class",
        `btn btn-light  ${block ? "pulse" : ""}`
      );

      // Update counter
      favoriteActionButton
        .find("#subscribedCount")
        .text(
          ` (${placeFavorites.count}) ` +
            `${hasFavorited ? "Remove from " : "Add to "} favorites`
        );
      favoriteActionButton;

      // Update bindings
      favoriteActionButton
        .attr("disabled", block)
        .unbind()
        .on("click", async () => {
          if (hasFavorited) {
            // Optimistic update
            const newPlaceFavorites = {
              count: placeFavorites.count - 1,
              results: placeFavorites.results.filter(
                placeFavorite => placeFavorite.event_id.toString() !== id
              )
            };
            UI.updateModalActions(newPlaceFavorites, id, true);

            await PlacesApi.deleteFavorite(id);
            UI.updateModalActions(newPlaceFavorites, id);
          } else {
            // Optimistic update
            const newOptimisticPlaceFavorites = {
              count: placeFavorites.count + 1,
              results: [
                ...placeFavorites.results,
                { event_id: id, user_id: UserApi.getUserId() }
              ]
            };
            UI.updateModalActions(newOptimisticPlaceFavorites, id, true);

            const placeFavorite = await PlacesApi.createFavorite(id);
            const newPlacesFavorites = {
              count: placeFavorites.count + 1,
              results: [...placeFavorites.results, { ...placeFavorite }]
            };
            UI.updateModalActions(newPlacesFavorites, id);
          }
        });
    },

    bindModalAction: () => {
      UI.getPlacePreview()
        .unbind()
        .on("show.bs.modal", async domEvent => {
          const button = $(domEvent.relatedTarget); // Button that triggered the modal
          const id = unescape(button.data("id")); // Extract info from data-* attributes
          const title = unescape(button.data("title")); // Extract info from data-* attributes
          const description = unescape(button.data("description")); // Extract info from data-* attributes
          const url = unescape(button.data("url")); // Extract info from data-* attributes
          const modal = UI.getModal();
          modal.find(".modal-title").html(title);
          modal.find(".modal-body").html(description);
          modal.find(".modal-footer").hide();
          modal.find(".modal-footer #eventUrl").prop("href", url);

          const placeFavorites = await PlacesApi.getPlaceFavorites(id);
          const hasFavorited = placeFavorites.results.find(
            event => event.user_id.toString() === UserApi.getUserId()
          );

          UI.updateModalActions(placeFavorites, id);
        });
    },
    displayPlaces: places => {
      places.forEach(suggestion => {
        UI.getPlacesList().append(UI.buildPlaceHtml(suggestion));
      });
    },
    fetchPlacesAndDisplay: async city => {
      UI.disableSubmit();
      UI.toggleLoading();
      UI.getPlacesList().html("");

      const places = await PlacesApi.findPlaces(city);
      UI.enableSubmit();
      UI.displayPlaces(places);
    },
    bindFormActions: () => {
      const validate = e => {
        const code = e.keyCode ? e.keyCode : e.which;
        if (code == 13) {
          return;
        }

        if (UI.validate()) {
          UI.enableSubmit();
        } else {
          UI.disableSubmit();
        }
      };

      UI.getCityField()
        .unbind()
        .on("change keyup paste focus", validate);
      UI.getForm()
        .unbind()
        .on("submit", event => {
          event.preventDefault();
          const city = $.trim(UI.getCityField().val());

          history.pushState({}, "", `/?city=${city}`);
          UI.fetchPlacesAndDisplay(city);
        });
    },
    init: () => {
      UI.bindModalAction();
      UI.bindFormActions();
      UI.getCityField().focus();

      const city = UI.getCityUrlParameter();

      if (city) {
        UI.getCityField().val(city);
        UI.fetchPlacesAndDisplay(city);
      }
    }
  };

  const init = () => {
    if (!UserApi.getUserId()) {
      UserApi.createUserId();
    }

    UI.init();
  };

  $(document).ready(init);
  $(window).on("popstate", init);
})();
