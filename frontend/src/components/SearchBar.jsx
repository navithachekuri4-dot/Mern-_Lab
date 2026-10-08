import React from 'react';
import { Search } from 'lucide-react';

/**
 * SearchBar Component
 * A simple controlled input for searching products by name.
 *
 * Props:
 *  - value: current search string (from parent state)
 *  - onChange: function to call when the user types
 */
function SearchBar({ value, onChange }) {
  return (
    <div className="searchbar-wrap">
      {/* Search Icon inside the input */}
      <Search size={17} className="searchbar-icon" />
      <input
        id="product-search-input"
        type="text"
        className="searchbar-input"
        placeholder="Search products..."
        value={value}
        onChange={(e) => onChange(e.target.value)}
        autoComplete="off"
      />
    </div>
  );
}

export default SearchBar;
