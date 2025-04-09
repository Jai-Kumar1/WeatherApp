import React from "react";

function SearchEngine({ query, setQuery, search }) {
  const handleKeyPress = (e) => {
    if (e.key === 'Enter') {
      search(e);
    }
  };

  return (
<div className="SearchEngine">
  <input
    type="text"
    className="city-search"
    placeholder="Enter City Name"
    name="query"
    value={query}
    onChange={(e) => setQuery(e.target.value)}
    onKeyDown={handleKeyPress}
  />
  <button type="submit" onClick={search}>
    Submit
  </button>
</div>
  );
}

export default SearchEngine;
