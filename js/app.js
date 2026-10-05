
import * as model from "./model.js";

import searchView from "./views/SearchView.js";
import resultsView from "./views/ResultsView.js";
import detailView from "./views/DetailView.js";

// STATE
let selectedId = null;
let occupants = 1;
let includeTransport = false;

// CONTROLLERS

const resultsController = () => {
  searchView.renderCount(model.state.filtered.length);

  resultsView.render(model.state.filtered);

  resultsView.markSelected(selectedId);
};

const selectController = (id) => {
  selectedId = id;

  const listing = model.state.listings.find(
    (listing) => String(listing.id) === String(selectedId)
  );

  if (!listing) return;

  occupants = listing.maxOccupants;
  includeTransport = false;

  resultsView.markSelected(selectedId);

  detailView.render(listing, occupants, includeTransport);
};

const searchController = (term) => {
  model.setSearchTerm(term);

  resultsController();
};

const maxRentController = (value) => {
  model.setMaxRent(value);

  resultsController();
};

const occupantsController = (value) => {
  occupants = value;

  detailView.updateBreakdown(occupants, includeTransport);
};

const fareController = (checked) => {
  includeTransport = checked;

  detailView.updateBreakdown(occupants, includeTransport);
};

// INITIALIZE

const init = () => {
  searchView.addSearchHandler(searchController);
  searchView.addMaxRentHandler(maxRentController);
  searchView.addFormHandler();

  resultsView.addSelectHandler(selectController);

  detailView.addOccupantsHandler(occupantsController);
  detailView.addFareHandler(fareController);

  detailView.renderEmpty();

  resultsController();
};

init();