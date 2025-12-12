import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

const MyInfo = () => {
  const [builds, setBuilds] = useState([]);
  const navigate = useNavigate();
  
  // 룬 이미지 매핑을 위한 데이터
  const [runeData, setRuneData] = useState([]); 
  const [latestVersion, setLatestVersion] = useState('');

  // 데이터 불러오기
  const loadBuilds = () => {
    const saved = JSON.parse(localStorage.getItem('myBuilds')) || [];
    setBuilds(saved.reverse()); // 최신순 정렬
  };

  useEffect(() => {
    loadBuilds();

    // 룬 데이터 및 최신 버전 가져오기
    const fetchRuneData = async () => {
      try {
        const vRes = await fetch('https://ddragon.leagueoflegends.com/api/versions.json');
        const vJson = await vRes.json();
        const ver = vJson[0];
        setLatestVersion(ver);

        const rRes = await fetch(`https://ddragon.leagueoflegends.com/cdn/${ver}/data/ko_KR/runesReforged.json`);
        const rJson = await rRes.json();
        setRuneData(rJson);
      } catch (err) {
        console.error("룬 데이터 로딩 실패:", err);
      }
    };
    fetchRuneData();

    window.addEventListener('storage', loadBuilds);
    return () => window.removeEventListener('storage', loadBuilds);
  }, []);

  const handleDelete = (id) => {
    if (window.confirm("정말 삭제하시겠습니까?")) {
      const filtered = builds.filter(b => b.id !== id);
      localStorage.setItem('myBuilds', JSON.stringify(filtered));
      setBuilds(filtered);
    }
  };

  // [수정된 부분] 수정 버튼 핸들러
  const handleEdit = (build) => {
    // URL 뒤에 ID를 붙여서 이동 (예: /update/170234...)
    navigate(`/update/${build.id}`);
  };

  const getRuneIcon = (id) => {
    if (!runeData.length || !id) return null;
    
    // 1단계: 룬 스타일(정밀, 지배 등)인지 확인
    const style = runeData.find(r => r.id == id);
    if (style) return `https://ddragon.leagueoflegends.com/cdn/img/${style.icon}`;

    // 2단계: 핵심 룬(정복자 등)인지 확인
    for (const group of runeData) {
      for (const slot of group.slots) {
        const rune = slot.runes.find(r => r.id == id);
        if (rune) return `https://ddragon.leagueoflegends.com/cdn/img/${rune.icon}`;
      }
    }
    return null; 
  };

  // URL 생성 헬퍼
  const getSpellImg = (ver, id) => `https://ddragon.leagueoflegends.com/cdn/${ver}/img/spell/${id}.png`;
  const getItemImg = (ver, id) => `https://ddragon.leagueoflegends.com/cdn/${ver}/img/item/${id}.png`;
  const getSkinImg = (id, num) => `https://ddragon.leagueoflegends.com/cdn/img/champion/loading/${id}_${num || 0}.jpg`;

  if (builds.length === 0) return (
    <div className="text-center py-5 text-white">
      <h3>저장된 공략이 없습니다.</h3>
      <p>챔피언 빌드 생성 메뉴에서 나만의 공략을 만들어보세요!</p>
    </div>
  );

  return (
    <div className="container py-4">
      <h2 className="fw-bold mb-4 text-white">내 빌드 보관함</h2>
      <div className="row g-4">
        {builds.map((build) => (
          <div key={build.id} className="col-12 col-xl-6">
            <div className="card h-100 shadow-sm border-0" style={{backgroundColor: '#f8f9fa'}}>
              
              {/* 카드 헤더: 스킨 배경 */}
              <div style={{
                height: '350px', 
                backgroundImage: `url(${getSkinImg(build.championId, build.skinId)})`,
                backgroundPosition: 'top center',
                backgroundSize: 'cover',
                backgroundRepeat: 'no-repeat',
                position: 'relative'
              }}>
                <div className="position-absolute bottom-0 start-0 bg-dark text-white px-3 py-1 bg-opacity-75 w-100">
                  <h5 className="m-0 fw-bold">{build.championId} <span className="fs-6 fw-normal">({build.position})</span></h5>
                </div>
                <div className="d-flex align-items-center bg-black bg-opacity-50 p-2 rounded border border-secondary">
                  {build.runeStyle && (
                    <img src={getRuneIcon(build.runeStyle)} title="룬 빌드" alt="Rune" width="40" className="me-2"/>
                  )}
                  {build.runeCore && (
                    <img src={getRuneIcon(build.runeCore)} title="핵심 룬" alt="Keystone" width="40"/>
                  )}
                </div>
              </div>

              <div className="card-body">
                {/* 스펠 & 스킬 */}
                <div className="mb-3 d-flex align-items-center">
                  <div className="me-3">
                    <small className="d-block text-muted mb-1">스펠</small>
                    {build.spell1 && <img src={getSpellImg(build.version, build.spell1)} width="30" className="me-1 rounded border border-secondary" alt="D"/>}
                    {build.spell2 && <img src={getSpellImg(build.version, build.spell2)} width="30" className="rounded border border-secondary" alt="F"/>}
                  </div>
                  <div>
                    <small className="d-block text-muted mb-1">스킬 순서</small>
                    <span className="badge bg-primary fs-6">{build.skillOrder}</span>
                  </div>
                </div>

                {/* 아이템 빌드 */}
                <div className="mb-3">
                  <small className="d-block text-muted mb-1">아이템 트리</small>
                  <div className="d-flex flex-wrap gap-1">
                    {build.itemBuild.length > 0 ? build.itemBuild.map((item, idx) => (
                      <img key={idx} src={getItemImg(build.version, item)} width="35" className="rounded border border-secondary" alt="item"/>
                    )) : <span className="text-muted small">아이템 없음</span>}
                  </div>
                </div>
              </div>

              {/* 4. 수정 / 삭제 버튼 영역 */}
              <div className="card-footer bg-white border-top-0 d-flex justify-content-end gap-2">
                <button 
                  className="btn btn-sm btn-primary" // 파란색 버튼
                  onClick={() => handleEdit(build)}
                >
                  수정
                </button>
                <button 
                  className="btn btn-sm btn-outline-danger" // 빨간색 테두리 버튼
                  onClick={() => handleDelete(build.id)}
                >
                  삭제
                </button>
              </div>

            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default MyInfo;