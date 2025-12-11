import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

const MyInfo = () => {
  const [builds, setBuilds] = useState([]);
  const [runeData, setRuneData] = useState([]); // 룬 이미지 찾기용 데이터
  const [latestVersion, setLatestVersion] = useState('');
  const navigate = useNavigate();

  // 데이터 불러오기 (Local Storage + Rune API)
  useEffect(() => {
    const initData = async () => {
      // 저장된 빌드 가져오기
      const saved = JSON.parse(localStorage.getItem('myBuilds')) || [];
      setBuilds(saved.reverse());

      try {
        // 최신 버전 및 룬 데이터 가져오기 (이미지 매핑용)
        const vRes = await fetch('https://ddragon.leagueoflegends.com/api/versions.json');
        const vJson = await vRes.json();
        const ver = vJson[0];
        setLatestVersion(ver);

        const rRes = await fetch(`https://ddragon.leagueoflegends.com/cdn/${ver}/data/ko_KR/runesReforged.json`);
        const rJson = await rRes.json();
        setRuneData(rJson);

      } catch (err) {
        console.error("룬 정보 로딩 실패", err);
      }
    };

    initData();

    // 저장 이벤트 감지 (다른 탭에서 변경 시 반영)
    const handleStorageChange = () => initData();
    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, []);

  const handleDelete = (id) => {
    if (window.confirm("정말 이 공략을 삭제하시겠습니까?")) {
      const filtered = builds.filter(b => b.id !== id);
      localStorage.setItem('myBuilds', JSON.stringify(filtered));
      setBuilds(filtered);
    }
  };

  // --- 헬퍼 함수들 ---

  // 룬 ID로 이미지 경로 찾기 (Data Dragon 구조 탐색)
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
    return null; // 못 찾음
  };

  const getSpellImg = (ver, id) => `https://ddragon.leagueoflegends.com/cdn/${ver}/img/spell/${id}.png`;
  const getItemImg = (ver, id) => `https://ddragon.leagueoflegends.com/cdn/${ver}/img/item/${id}.png`;
  // 스킨 이미지는 로딩(loading)보다 스플래시(splash)가 더 크고 멋있지만, 로딩화면 비율(loading)을 유지하며 크게 보여줌.
  const getSkinImg = (id, num) => `https://ddragon.leagueoflegends.com/cdn/img/champion/loading/${id}_${num || 0}.jpg`;


  if (builds.length === 0) return (
    <div className="text-center py-5">
      <h3 className="text-muted">아직 저장된 빌드가 없습니다.</h3>
      <p>챔피언 빌드 생성 메뉴에서 나만의 공략을 만들어보세요!</p>
    </div>
  );

  return (
    <div className="container py-4">
      <h2 className="fw-bold mb-4 text-white">내 빌드 보관함</h2>
      
      {/* 카드 크기를 키우기 위해 col-lg-4 -> col-xl-6 (한 줄에 2개) 또는 col-12 (한 줄에 1개) 사용 */}
      <div className="row g-4">
        {builds.map((build) => (
          <div key={build.id} className="col-12 col-xl-6"> {/* 너비 대폭 확대 */}
            <div className="card h-100 shadow border-0 overflow-hidden bg-dark text-white">
              
              {/* --- 상단: 스킨 이미지 (높이 300px로 확대) --- */}
              <div style={{
                height: '350px', 
                backgroundImage: `url(${getSkinImg(build.championId, build.skinId)})`,
                backgroundPosition: 'top center',
                backgroundSize: 'cover',
                backgroundRepeat: 'no-repeat',
                position: 'relative'
              }}>
                {/* 텍스트 가독성을 위한 그라데이션 오버레이 */}
                <div className="position-absolute bottom-0 start-0 w-100 p-4" 
                     style={{ background: 'linear-gradient(to top, rgba(0,0,0,0.9), transparent)' }}>
                  <div className="d-flex justify-content-between align-items-end">
                    <div>
                      <span className="badge bg-primary mb-2">{build.position}</span>
                      <h2 className="fw-bold m-0 text-white" style={{ textShadow: '2px 2px 4px black' }}>
                        {build.championId}
                      </h2>
                    </div>
                    {/* 룬 이미지 표시 영역 */}
                    <div className="d-flex align-items-center bg-black bg-opacity-50 p-2 rounded">
                      {build.runeStyle && (
                        <img src={getRuneIcon(build.runeStyle)} title="룬 빌드" alt="Rune" width="40" className="me-2"/>
                      )}
                      {build.runeCore && (
                        <img src={getRuneIcon(build.runeCore)} title="핵심 룬" alt="Keystone" width="40"/>
                      )}
                    </div>
                  </div>
                </div>
              </div>

              {/* --- 하단: 상세 정보 --- */}
              <div className="card-body p-4 bg-secondary bg-opacity-10">
                <div className="row align-items-center">
                  
                  {/* 스펠 & 스킬 */}
                  <div className="col-md-5 mb-3 mb-md-0 border-end border-secondary">
                    <div className="mb-3">
                      <small className="text-muted d-block mb-1">소환사 주문</small>
                      <div className="d-flex gap-2">
                        {build.spell1 && <img src={getSpellImg(build.version, build.spell1)} width="45" className="rounded shadow-sm" alt="D"/>}
                        {build.spell2 && <img src={getSpellImg(build.version, build.spell2)} width="45" className="rounded shadow-sm" alt="F"/>}
                      </div>
                    </div>
                    <div>
                      <small className="text-muted d-block mb-1">스킬 마스터리</small>
                      <span className="badge bg-warning text-dark fs-5 fw-bold">{build.skillOrder}</span>
                    </div>
                  </div>

                  {/* 아이템 빌드 */}
                  <div className="col-md-7">
                    <small className="text-muted d-block mb-1">최종 아이템</small>
                    <div className="d-flex flex-wrap gap-2">
                      {build.itemBuild.length > 0 ? build.itemBuild.map((item, idx) => (
                        <div key={idx} className="position-relative">
                          <img 
                            src={getItemImg(build.version, item)} 
                            width="50" 
                            className="rounded border border-secondary shadow-sm" 
                            alt="item"
                          />
                        </div>
                      )) : <span className="text-muted small">아이템 없음</span>}
                    </div>
                  </div>
                </div>
              </div>

              <div className="card-footer bg-dark border-top border-secondary d-flex justify-content-between align-items-center">
                <small className="text-muted">버전: {build.version}</small>
                <div>
                  {/* 3. 수정 버튼 추가 */}
                  <button 
                    className="btn btn-outline-warning btn-sm px-3 me-2" 
                    onClick={() => navigate(`/edit/${build.id}`)}
                  >
                    ✏️ 수정
                  </button>
                  
                  <button className="btn btn-outline-danger btn-sm px-3" onClick={() => handleDelete(build.id)}>
                    🗑 삭제
                  </button>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default MyInfo;