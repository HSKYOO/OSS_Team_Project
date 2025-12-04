import React, { useState } from 'react';

const SearchChamp = ({ onSearch }) => {
  const [input, setInput] = useState('');

  const handleSearch = () => {
    if (input.trim()) {
      onSearch(input);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter') {
      handleSearch();
    }
  };

  return (
    <div className="search-container text-center w-100" style={{ maxWidth: '600px', margin: '0 auto', marginTop: '100px' }}>
      <h1 className="mb-4 display-5 fw-bold">LoL 챔피언 도감 (React)</h1>
      <div className="input-group mb-3">
        <input
          type="text"
          className="form-control form-control-lg"
          placeholder="챔피언 이름 (예: 아리, Garen)"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyPress={handleKeyPress}
        />
        <button className="btn btn-primary btn-lg" onClick={handleSearch}>
          검색
        </button>
      </div>
    </div>
  );
};

export default SearchChamp;