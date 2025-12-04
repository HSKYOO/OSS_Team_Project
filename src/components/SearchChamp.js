import React, { useState } from 'react';

const SearchChamp = ({ onSearch, championData }) => {
  const [input, setInput] = useState('');
  const [suggestions, setSuggestions] = useState([]);

  const handleInputChange = (e) => {
    const value = e.target.value;
    setInput(value);

    if (value.length > 0 && championData) {
      // 1. 객체를 배열로 변환
      const champArray = Object.values(championData);

      // 2. 필터링 (한글 이름 or 영어 ID 포함 여부)
      const filtered = champArray.filter((champ) => 
        champ.name.includes(value) || 
        champ.id.toLowerCase().includes(value.toLowerCase())
      );

      // 3. 정렬 (가나다 순)
      filtered.sort((a, b) => a.name.localeCompare(b.name, 'ko'));

      setSuggestions(filtered);
    } else {
      setSuggestions([]); // 입력이 없으면 목록 숨김
    }
  };

  const handleSearch = () => {
    if (input.trim()) {
      onSearch(input);
      setSuggestions([]);
    }
  };

  const handleSuggestionClick = (suggestion) => {
    setInput(suggestion.name); // 입력창에 이름 채우기
    onSearch(suggestion.name); // 바로 검색 실행 (선택사항)
    setSuggestions([]);
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter') {
      handleSearch();
    }
  };

  return (
    <div className="search-container text-center w-100" style={{ maxWidth: '600px', margin: '0 auto', marginTop: '100px' }}>
      <h1 className="mb-4 display-5 fw-bold">LoL 챔피언 도감 (React)</h1>
      <div className="position-relative mx-auto" style={{ maxWidth: '600px' }}>
        <div className="input-group mb-3">
            <input
            type="text"
            className="form-control form-control-lg"
            placeholder="챔피언 이름"
            value={input}
            onChange={handleInputChange}
            onKeyPress={handleKeyPress}
            autoComplete="off"
            />
            <button className="btn btn-primary btn-lg" onClick={handleSearch}>
            검색
            </button>
        </div>

        {/* 자동완성 드롭다운 메뉴 (suggestions가 있을 때만 표시) */}
        {suggestions.length > 0 && (
            <ul className="list-group position-absolute w-100 text-start shadow-lg" 
                style={{ 
                    top: '100%',
                    zIndex: 1000, 
                    maxHeight: '300px', 
                    overflowY: 'auto',
                    borderRadius: '10px'
                }}>
            {suggestions.map((champ) => (
                <li 
                key={champ.key} 
                className="list-group-item list-group-item-action d-flex align-items-center"
                style={{ cursor: 'pointer' }}
                onClick={() => handleSuggestionClick(champ)}
                >
                {/* 작은 썸네일 이미지 추가 (시각적 효과) */}
                <img 
                    src={`https://ddragon.leagueoflegends.com/cdn/${champ.version}/img/champion/${champ.id}.png`}
                    alt={champ.name}
                    style={{ width: '30px', height: '30px', borderRadius: '50%', marginRight: '10px' }}
                />
                <div>
                    <span className="fw-bold">{champ.name}</span>
                    <span className="text-muted small ms-2">({champ.title})</span>
                </div>
                </li>
            ))}
            </ul>
        )}
      </div>
    </div>
  );
};

export default SearchChamp;