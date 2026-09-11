// BoardingEase — Week 4 end state
//
// Continues the file the class built together. Same names and style:
// markupGenerator, results, newListings, detailMarkUpGenerator.
//
// New this week: a pure cost calculation, exceptions for invalid input,
// and a targeted breakdown update that does not destroy the input the
// user is typing into.
//
// Still one flat file. That is deliberate -- Week 5 refactors it.

import { listings } from "./data.js";

/* ---------------------------------------------------------------
   ELEMENTS
   --------------------------------------------------------------- */

const resultsList = document.querySelector(".results__list");
const detailsContainer = document.querySelector(".detail");
const searchCount = document.querySelector(".search__count");


// CHANGED: was ".field__input", which is on TWO inputs (search and max
// rent). It worked only because the search box comes first in the HTML.
// Move the inputs around and it would silently break.
const fieldInput = document.querySelector("#search-input");
const searchForm = document.querySelector("#search-form");
const maxRentInput = document.querySelector("#max-rent");

/* ---------------------------------------------------------------
   STATE
   --------------------------------------------------------------- */

let newListings = listings;
let selectedId = null;
let occupants = 1;
let includeTransport = false;

const SCHOOL_DAYS_PER_MONTH = 22;

// Built once, at module level. Constructing a formatter inside a render
// function would rebuild it on every card.
const peso = new Intl.NumberFormat("en-PH", {
  style: "currency",
  currency: "PHP",
  maximumFractionDigits: 0,
});

/* ---------------------------------------------------------------
   THE RULE
   Pure: numbers in, numbers out. No DOM, no globals.
   In Week 10 this same function moves to the server, because a user
   can send us any number they like. One rule, one file, two callers.
   It THROWS rather than returning an error, because it does not know
   whether its caller should render a message or send a 400.
   --------------------------------------------------------------- */

const sumUtilities = ({ electricity = 0, water = 0, internet = 0 }) =>
  electricity + water + internet;

const calculateCostPerHead = (listing, people, withTransport) => {
  if (!Number.isInteger(people) || people < 1) {
    throw new Error("Number of occupants must be a whole number, at least 1.");
  }

  if (people > listing.maxOccupants) {
    throw new Error(
      `This listing allows at most ${listing.maxOccupants} occupants.`,
    );
  }

  const rentPerHead = listing.monthlyRent / people;

  const utilitiesPerHead = listing.utilitiesIncluded
    ? 0
    : sumUtilities(listing.estimatedUtilities) / people;

  // Transport does NOT divide. Sharing a room does not make the jeepney
  // cheaper -- everyone pays their own fare, both ways, every school day.
  const transportPerHead = withTransport
    ? listing.fareOneWay * 2 * SCHOOL_DAYS_PER_MONTH
    : 0;

  return {
    rentPerHead,
    utilitiesPerHead,
    transportPerHead,
    totalPerHead: rentPerHead + utilitiesPerHead + transportPerHead,
  };
};

/* ---------------------------------------------------------------
   CARD MARKUP
   --------------------------------------------------------------- */

const markupGenerator = (listing) => {
  // Gi destructure nato dire ang object
  const {
    id,
    name,
    barangay,
    monthlyRent,
    maxOccupants,
    utilitiesIncluded,
    distanceToCampusKm,
  } = listing;

  // FIXED: both branches used to say the same thing with the same class,
  // and the condition was backwards.
  const utilitiesTag = utilitiesIncluded
    ? `<span class="tag">Utilities included</span>`
    : `<span class="tag tag--utilities">Utilities extra</span>`;

  return `<li>
              <button
                class="card"
                type="button"
                data-id="${id}"
                aria-pressed="${id === selectedId}"
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
                  <span class="card__meta"
                    >${barangay} &middot; ${distanceToCampusKm} km from campus &middot; up to ${maxOccupants}</span
                  >
                  <span class="card__rent">${peso.format(monthlyRent)} / month</span>
                  <span class="tags">${utilitiesTag}</span>
                </span>
              </button>
            </li>`;
};

const results = () => {
  searchCount.textContent = `${newListings.length} listing${
    newListings.length === 1 ? "" : "s"
  } found`;

  if (newListings.length === 0) {
    resultsList.innerHTML = `<li class="empty">
              No listings match that search.
            </li>`;

    return;
  }

  resultsList.innerHTML = newListings.map(markupGenerator).join("");
};

/* ---------------------------------------------------------------
   DETAIL MARKUP
   Split in two so the breakdown can be re-rendered on its own.
   --------------------------------------------------------------- */

const breakdownContent = (listing) => {
  try {
    const { rentPerHead, utilitiesPerHead, transportPerHead, totalPerHead } =
      calculateCostPerHead(listing, occupants, includeTransport);

    return `
            <p class="breakdown__line">
              <span>Rent</span><span>${peso.format(rentPerHead)}</span>
            </p>
            <p class="breakdown__line">
              <span>Utilities</span><span>${peso.format(utilitiesPerHead)}</span>
            </p>
            <p class="breakdown__line">
              <span>Transport</span><span>${peso.format(transportPerHead)}</span>
            </p>
            <p class="breakdown__total">
              <span>Per person</span><span>${peso.format(totalPerHead)}</span>
            </p>`;
  } catch (err) {
    // The calculation threw. It does not know we are in a browser, so
    // deciding what to show is our job, here, at the call site.
    return `<p class="error">${err.message}</p>`;
  }
};

const detailMarkUpGenerator = (listing) => {
  const { name, barangay, monthlyRent, maxOccupants } = listing;

  return `
   <h2 class="detail__name">${name}</h2>
          <p class="detail__where">${barangay} &middot; ${peso.format(monthlyRent)} / month</p>
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
                value="${occupants}"
              />
            </div>

            <div class="splitter__row">
              <label for="transport-demo">Include daily fare</label>
              <input type="checkbox" id="transport-demo" ${
                includeTransport ? "checked" : ""
              } />
            </div>
          </fieldset>

          <div class="breakdown">${breakdownContent(listing)}</div>
  `;
};

const selectedListing = () => listings.find((item) => item.id === selectedId);

const renderDetail = () => {
  if (!selectedId) {
    detailsContainer.innerHTML = `<p class="detail__empty">Select a listing to see the cost breakdown.</p>`;
    return;
  }

  const listing = selectedListing();

  // GUARD: find() returns undefined on a miss, and undefined.name throws.
  if (!listing) {
    detailsContainer.innerHTML = `<p class="error">That listing could not be found.</p>`;
    return;
  }

  detailsContainer.innerHTML = detailMarkUpGenerator(listing);
};

const updateBreakdown = () => {
  const breakdown = detailsContainer.querySelector(".breakdown");
  if (!breakdown) return;

  const listing = selectedListing();
  if (!listing) return;

  breakdown.innerHTML = breakdownContent(listing);
};

/* ---------------------------------------------------------------
   EVENTS
   --------------------------------------------------------------- */

// One listener on the list, not one per card: results() replaces every
// card, so per-card listeners would die on the next render.
resultsList.addEventListener("click", (event) => {
  const card = event.target.closest(".card");

  if (!card) return;

  selectedId = card.dataset.id;

  const listing = selectedListing();
  if (!listing) return;

  occupants = listing.maxOccupants;

  results(); // re-render so aria-pressed moves to the clicked card
  renderDetail();
});

detailsContainer.addEventListener("input", (event) => {
  if (event.target.id === "occupants-demo") {
    occupants = Number(event.target.value);
    updateBreakdown();
  }

  if (event.target.id === "transport-demo") {
    includeTransport = event.target.checked;
    updateBreakdown();
  }
});

const filterListings = () => {
  const searchValue = fieldInput.value.toLowerCase().trim();
  const maxRentValue = maxRentInput.value;

  newListings = listings.filter((listing) => {
    const matchesSearch =
      searchValue === "" ||
      listing.name.toLowerCase().includes(searchValue);

    const matchesRent =
      maxRentValue === "" ||
      listing.monthlyRent <= Number(maxRentValue);

    return matchesSearch && matchesRent;
  });

  results();
};

fieldInput.addEventListener("input", filterListings);
maxRentInput.addEventListener("input", filterListings);

searchForm.addEventListener("submit", (e) => {
  e.preventDefault();
});

/* ---------------------------------------------------------------
   START
   --------------------------------------------------------------- */

results();
renderDetail();
