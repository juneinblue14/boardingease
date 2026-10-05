
import View from "./View.js";

class DetailView extends View {
  _parentElement = document.querySelector(".detail");
  _errorMessage = "That listing could not be found.";

  _occupants = 1;
  _includeTransport = false;

  _peso = new Intl.NumberFormat("en-PH", {
    style: "currency",
    currency: "PHP",
    maximumFractionDigits: 0,
  });

  _schoolDaysPerMonth = 22;

  addOccupantsHandler(handler) {
    this._parentElement.addEventListener("input", (e) => {
      if (e.target.id !== "occupants-demo") return;

      handler(Number(e.target.value));
    });
  }

  addFareHandler(handler) {
    this._parentElement.addEventListener("change", (e) => {
      if (e.target.id !== "transport-demo") return;

      handler(e.target.checked);
    });
  }

  render(listing, occupants, includeTransport) {
    this._occupants = occupants;
    this._includeTransport = includeTransport;

    if (!listing) {
      this.renderEmpty();
      return;
    }

    super.render(listing);
  }

  renderEmpty() {
    this._parentElement.innerHTML =
      `<p class="detail__empty">Select a listing to see the cost breakdown.</p>`;
  }

  _sumUtilities = ({
    electricity = 0,
    water = 0,
    internet = 0,
  }) => electricity + water + internet;

  _calculateCostPerHead = (listing) => {
    const people = this._occupants;

    if (!Number.isInteger(people) || people < 1) {
      throw new Error(
        "Number of occupants must be a whole number, at least 1."
      );
    }

    if (people > listing.maxOccupants) {
      throw new Error(
        `This listing allows at most ${listing.maxOccupants} occupants`
      );
    }

    const rentPerHead = listing.monthlyRent / people;

    const utilitiesPerHead = listing.utilitiesIncluded
      ? 0
      : this._sumUtilities(listing.estimatedUtilities) / people;

    const transportPerHead = this._includeTransport
      ? listing.fareOneWay * 2 * this._schoolDaysPerMonth
      : 0;

    return {
      rentPerHead,
      utilitiesPerHead,
      transportPerHead,
      totalPerHead:
        rentPerHead + utilitiesPerHead + transportPerHead,
    };
  };

  _breakdownContent = (listing) => {
    try {
      const {
        rentPerHead,
        utilitiesPerHead,
        transportPerHead,
        totalPerHead,
      } = this._calculateCostPerHead(listing);

      return `
        <p class="breakdown__line">
          <span>Rent</span>
          <span>${this._peso.format(rentPerHead)}</span>
        </p>
        <p class="breakdown__line">
          <span>Utilities</span>
          <span>${this._peso.format(utilitiesPerHead)}</span>
        </p>
        <p class="breakdown__line">
          <span>Transport</span>
          <span>${this._peso.format(transportPerHead)}</span>
        </p>
        <p class="breakdown__total">
          <span>Per person</span>
          <span>${this._peso.format(totalPerHead)}</span>
        </p>
      `;
    } catch (err) {
      return `<p class="error">${err.message}</p>`;
    }
  };

  updateBreakdown(occupants, includeTransport) {
    this._occupants = occupants;
    this._includeTransport = includeTransport;

    const breakdown = this._parentElement.querySelector(".breakdown");

    if (!breakdown || !this._data) return;

    breakdown.innerHTML = this._breakdownContent(this._data);
  }

  _generateMarkup = () => {
    const {
      name,
      barangay,
      monthlyRent,
      maxOccupants,
    } = this._data;

    return `
      <h2 class="detail__name">${name}</h2>

      <p class="detail__where">
        ${barangay} &middot;
        ${this._peso.format(monthlyRent)} / month
      </p>

      <fieldset class="splitter">
        <legend class="splitter__legend">Split the cost</legend>

        <div class="splitter__row">
          <label for="occupants-demo">Sharing with</label>
          <input
            class="field__input"
            type="number"
            id="occupants-demo"
            min="1"
            max="${maxOccupants}"
            value="${this._occupants}"
          />
        </div>

        <div class="splitter__row">
          <label for="transport-demo">Include daily fare</label>
          <input
            type="checkbox"
            id="transport-demo"
            ${this._includeTransport ? "checked" : ""}
          />
        </div>
      </fieldset>

      <div class="breakdown">
        ${this._breakdownContent(this._data)}
      </div>
    `;
  };
}

export default new DetailView();