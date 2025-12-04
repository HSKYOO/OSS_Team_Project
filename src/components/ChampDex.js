import React, { useEffect, useState } from 'react';
import SearchChamp from './SearchChamp.js';
import ChampInfo from './ChampInfo.js';

const ChampionDex = () => {
  const [version, setVersion] = useState('');
  const [allChampions, setAllChampions] = useState({});
  const [selectedId, setSelectedId] = useState(null); 
  const [status, setStatus] = useState('데이터 로딩 중...');

  // 1. 초기 데이터 로드 (버전 및 챔피언 목록)
  useEffect(() => {
    const initData = async () => {
      try {
        // 최신 버전 확인
        const verRes = await fetch('https://ddragon.leagueoflegends.com/api/versions.json');
        const verJson = await verRes.json();
        const latestVersion = verJson[0];
        setVersion(latestVersion);

        // 챔피언 리스트 확인
        const listRes = await fetch(`https://ddragon.leagueoflegends.com/cdn/${latestVersion}/data/ko_KR/champion.json`);
        const listJson = await listRes.json();
        setAllChampions(listJson.data);

        setStatus(`현재 버전: ${latestVersion}`);
      } catch (error) {
        console.error(error);
        setStatus('데이터 로드 실패 (네트워크를 확인하세요)');
      }
    };

    initData();
  }, []);

  // 2. 검색 핸들러
  const handleSearch = (keyword) => {
    if (!keyword) return;
    const trimmedKeyword = keyword.replace(/\s+/g, '').toLowerCase();

    let foundId = null;
    for (const key in allChampions) {
      const champ = allChampions[key];
      // 한글 이름, 영문 ID, 공백 제거한 한글 이름 비교
      if (
        champ.name === keyword || 
        champ.id.toLowerCase() === trimmedKeyword || 
        champ.name.replace(/\s+/g, '') === keyword
      ) {
        foundId = champ.id;
        break;
      }
    }

    if (foundId) {
      setSelectedId(foundId);
    } else {
      alert('해당하는 챔피언을 찾을 수 없습니다.');
    }
  };

  const handleCloseModal = () => setSelectedId(null);

  return (
    <div className="champion-dex-container">
      {/* 검색창 컴포넌트 */}
      <SearchChamp onSearch={handleSearch} />
      
      {/* 상태 메시지 표시 */}
      <div className="text-center mt-3 text-muted">
        <small>{status}</small>
      </div>

      {/* 상세 정보 모달 */}
      <ChampInfo 
        show={!!selectedId} 
        onClose={handleCloseModal} 
        championId={selectedId} 
        version={version} 
      />
    </div>
  );
};

export default ChampionDex;