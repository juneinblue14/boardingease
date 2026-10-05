
import View from "./View.js";

class ResultsView extends View {
  _parentElement = document.querySelector(".results__list");
  _errorMessage = "No listings match that search. Try a barangay name.";

  addSelectHandler(handler) {
    this._parentElement.addEventListener("click", (e) => {
      const card = e.target.closest(".card");

      if (!card) return;

      handler(card.dataset.id);
    });
  }

  markSelected(id) {
    const cards = this._parentElement.querySelectorAll(".card");

    cards.forEach((card) => {
      const isSelected = card.dataset.id === String(id);

      card.setAttribute("aria-pressed", isSelected);
      card.classList.toggle("card--selected", isSelected);
    });
  }

  _generateMarkupCard = (listing) => {
    const {
      id,
      name,
      barangay,
      monthlyRent,
      maxOccupants,
      utilitiesIncluded,
      distanceToCampusKm,
    } = listing;

    const utilitiesTag = utilitiesIncluded
      ? `<span class="tag">Utilities included</span>`
      : `<span class="tag tag--utilities">Utilities extra</span>`;

    return `<li>
      <button
        class="card"
        type="button"
        data-id="${id}"
        aria-pressed="false"
      >
        <img
          class="card__image"
          alt=""
          width="96"
          height="96"
          loading="lazy"
          src="data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='96' height='96'><rect width='96' height='96' fill='%23e8f2ee'/><path d='M20 62l18-20 14 16 10-10 14 14v10H20z' fill='%231e7a5f' opacity='.45'/><circle cx='64' cy='32' r='7' fill='%231e7a5f' opacity='.45'/></svg>"
        />
        <span>
          <span class="card__name">${name}</span>
          <span class="card__meta">${barangay} &middot; ${distanceToCampusKm} km from campus &middot; up to ${maxOccupants}</span>
          <span class="card__rent">&#8369;${monthlyRent} / month</span>
          <span class="tags">${utilitiesTag}</span>
        </span>
      </button>
    </li>`;
  };

  _generateMarkup = () => {
    return this._data
      .map((listing) => this._generateMarkupCard(listing))
      .join("");
  };
}

export default new ResultsView();