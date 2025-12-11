import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';

const Update = () => {
  const navigate = useNavigate();
  const location = useLocation();

  // 1. 수정할 데이터 받기
  const targetBuild = location.state?.build || null;

  // --- [State 선언부] (항상 최상위에 위치해야 함) ---
  const [version, setVersion] = useState('');
  const [champions, setChampions] = useState([]);
  const [items, setItems] = useState([]);
  const [spells, setSpells] = useState([]);
  const [runes, setRunes] = useState([]);
  const [loading, setLoading] = useState(true);

  // 폼 데이터 State
  const [formData, setFormData] = useState({
    championId: targetBuild?.championId || '',
    position: targetBuild?.position || 'TOP',
    skinId: targetBuild?.skinId || '0',
    spell1: targetBuild?.spell1 || '',
    spell2: targetBuild?.spell2 || '',
    skillOrder: targetBuild?.skillOrder || 'Q>W>E',
    runeStyle: targetBuild?.runeStyle || '',
    runeCore: targetBuild?.runeCore || '',
    itemBuild: targetBuild?.itemBuild || []
  });

  const [selectedChampDetail, setSelectedChampDetail] = useState(null);

  // 검색 및 UI 제어 State
  const [champSearch, setChampSearch] = useState('');       
  const [champSuggestions, setChampSuggestions] = useState([]); 
  const [showChampDropdown, setShowChampDropdown] = useState(false);
  const [itemSearch, setItemSearch] = useState('');

  // 포지션 아이콘 설정
  const positions = [
    { key: 'TOP', name: '탑', icon: 'https://raw.communitydragon.org/latest/plugins/rcp-fe-lol-clash/global/default/assets/images/position-selector/positions/icon-position-top.png' },
    { key: 'JUNGLE', name: '정글', icon: 'https://raw.communitydragon.org/latest/plugins/rcp-fe-lol-clash/global/default/assets/images/position-selector/positions/icon-position-jungle.png' },
    { key: 'MIDDLE', name: '미드', icon: 'https://raw.communitydragon.org/latest/plugins/rcp-fe-lol-clash/global/default/assets/images/position-selector/positions/icon-position-middle.png' },
    { key: 'BOTTOM', name: '원딜', icon: 'https://raw.communitydragon.org/latest/plugins/rcp-fe-lol-clash/global/default/assets/images/position-selector/positions/icon-position-bottom.png' },
    { key: 'UTILITY', name: '서폿', icon: 'https://raw.communitydragon.org/latest/plugins/rcp-fe-lol-clash/global/default/assets/images/position-selector/positions/icon-position-utility.png' },
  ];

  // --- [useEffect 선언부] (if문보다 위에 있어야 함) ---

  // 2. 초기 데이터 로딩 (API)
  useEffect(() => {
    // 데이터가 없어도 API 호출 로직 내에서 방어 (Hook 순서 보장)
    if (!targetBuild) return; 

    const fetchData = async () => {
      try {
        setLoading(true);
        const vRes = await fetch('https://ddragon.leagueoflegends.com/api/versions.json');
        const vJson = await vRes.json();
        const ver = vJson[0];
        setVersion(ver);

        const [cRes, iRes, sRes, rRes] = await Promise.all([
          fetch(`https://ddragon.leagueoflegends.com/cdn/${ver}/data/ko_KR/champion.json`),
          fetch(`https://ddragon.leagueoflegends.com/cdn/${ver}/data/ko_KR/item.json`),
          fetch(`https://ddragon.leagueoflegends.com/cdn/${ver}/data/ko_KR/summoner.json`),
          fetch(`https://ddragon.leagueoflegends.com/cdn/${ver}/data/ko_KR/runesReforged.json`)
        ]);

        const cJson = await cRes.json();
        const iJson = await iRes.json();
        const sJson = await sRes.json();
        const rJson = await rRes.json();

        // 챔피언 정렬
        const sortedChamps = Object.values(cJson.data).sort((a, b) => a.name.localeCompare(b.name, 'ko'));
        setChampions(sortedChamps);

        // 검색창 프리필
        if (targetBuild?.championId) {
            const currentChamp = sortedChamps.find(c => c.id === targetBuild.championId);
            if (currentChamp) setChampSearch(currentChamp.name);
        }
        
        // 아이템 필터링
        const rawItems = Object.values(iJson.data);
        const uniqueItems = [];
        const itemNames = new Set();
        rawItems.forEach((item) => {
          if (item.gold.purchasable && item.maps['11'] === true && !itemNames.has(item.name) && !item.requiredAlly) {
            itemNames.add(item.name);
            uniqueItems.push(item);
          }
        });
        setItems(uniqueItems.sort((a, b) => a.name.localeCompare(b.name, 'ko')));

        setSpells(Object.values(sJson.data).filter(spell => spell.modes.includes("CLASSIC")));
        setRunes(rJson);

      } catch (err) {
        console.error("데이터 로딩 실패:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [targetBuild]); 

  // 3. 챔피언 스킨 정보 가져오기
  useEffect(() => {
    if (formData.championId && version) {
      const fetchSkin = async () => {
        try {
            const res = await fetch(`https://ddragon.leagueoflegends.com/cdn/${version}/data/ko_KR/champion/${formData.championId}.json`);
            const json = await res.json();
            setSelectedChampDetail(json.data[formData.championId]);
        } catch (e) { console.error(e); }
      };
      fetchSkin();
    }
  }, [formData.championId, version]);


  // --- [핸들러 함수들] ---

  const handleChampSearch = (e) => {
    const input = e.target.value;
    setChampSearch(input);
    setShowChampDropdown(true);

    if (input.trim() === '') {
      setChampSuggestions([]);
      return;
    }
    const filtered = champions.filter(c => 
      c.name.includes(input) || c.id.toLowerCase().includes(input.toLowerCase())
    );
    setChampSuggestions(filtered);
  };

  const selectChampion = (champ) => {
    // 챔피언 변경 시 스킨 초기화
    setFormData({ ...formData, championId: champ.id, skinId: '0' }); 
    setChampSearch(champ.name);
    setShowChampDropdown(false);
  };

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleItemAdd = (itemId) => {
    if (formData.itemBuild.length >= 6) return alert("아이템은 최대 6개입니다.");
    setFormData({ ...formData, itemBuild: [...formData.itemBuild, itemId] });
  };

  const handleItemRemove = (index) => {
    const newBuild = formData.itemBuild.filter((_, i) => i !== index);
    setFormData({ ...formData, itemBuild: newBuild });
  }

  const handleRuneStyleChange = (styleId) => {
    setFormData({ ...formData, runeStyle: styleId, runeCore: '' });
  };

  const handleRuneCoreChange = (coreId) => {
    setFormData({ ...formData, runeCore: coreId });
  };

  const handleUpdate = () => {
    if (!formData.championId) return alert("챔피언 정보가 없습니다.");
    
    const savedList = JSON.parse(localStorage.getItem('myBuilds')) || [];
    
    // ID가 일치하는 항목을 찾아 덮어쓰기 (map 사용)
    const updatedList = savedList.map(item => 
        item.id === targetBuild.id ? { ...formData, id: item.id, version } : item
    );

    localStorage.setItem('myBuilds', JSON.stringify(updatedList));
    alert("수정이 완료되었습니다!");
    navigate('/myinfo');
  };

  // --- [렌더링 로직] ---

  // 1. 잘못된 접근 방지 (Hook 호출 이후, 렌더링 직전에 검사)
  if (!targetBuild) {
    return (
      <div className="container py-5 text-center text-white" style={{ marginTop: '100px', backgroundColor: 'rgba(0,0,0,0.8)', borderRadius: '15px' }}>
        <h2 className="fw-bold">⚠️ 데이터가 없습니다.</h2>
        <p className="mb-4">새로고침을 하거나 주소로 직접 접속하면 수정 데이터를 불러올 수 없습니다.<br />[내 빌드] 페이지에서 다시 시도해주세요.</p>
        <button className="btn btn-warning fw-bold" onClick={() => navigate('/myinfo')}>돌아가기</button>
      </div>
    );
  }

  // 2. 로딩 화면
  if (loading) {
    return (
        <div className="container py-5 text-center text-white" style={{ marginTop: '100px' }}>
            <h3>데이터를 불러오는 중입니다...</h3>
            <div className="spinner-border text-primary mt-3" role="status"></div>
        </div>
    );
  }

  const selectedRuneStyle = runes.find(r => r.id == formData.runeStyle);
  const keystoneList = selectedRuneStyle ? selectedRuneStyle.slots[0].runes : [];

  return (
    <div className="container py-4">
      <h2 className="fw-bold mb-4 text-white" style={{color: '#C89B3C'}}>🛠️ 챔피언 빌드 수정</h2>
      
      {/* --- 섹션 1: 챔피언 & 포지션 선택 --- */}
      <div className="card bg-dark text-white mb-4 shadow-lg border-secondary">
        <div className="card-body p-4">
          <div className="row g-4">
            
            {/* 1. 챔피언 검색 */}
            <div className="col-md-7 position-relative">
              <label className="form-label fw-bold text-warning">챔피언 선택</label>
              <div className="input-group input-group-lg">
                <span className="input-group-text bg-secondary text-white border-0">🔍</span>
                <input 
                  type="text" 
                  className="form-control bg-dark text-white border-secondary"
                  placeholder="챔피언 검색"
                  value={champSearch}
                  onChange={handleChampSearch}
                  onFocus={() => setShowChampDropdown(true)}
                />
              </div>

              {/* 드롭다운 */}
              {showChampDropdown && champSuggestions.length > 0 && (
                <ul className="list-group position-absolute w-100 shadow-lg mt-1" style={{ zIndex: 1000, maxHeight: '300px', overflowY: 'auto' }}>
                  {champSuggestions.map(c => (
                    <li 
                      key={c.id} 
                      className="list-group-item list-group-item-action bg-dark text-white border-secondary d-flex align-items-center"
                      style={{ cursor: 'pointer' }}
                      onClick={() => selectChampion(c)}
                    >
                      <img src={`https://ddragon.leagueoflegends.com/cdn/${version}/img/champion/${c.image.full}`} 
                           alt={c.name} className="rounded-circle me-3 border border-secondary" width="40" height="40"/>
                      <span>{c.name}</span>
                    </li>
                  ))}
                </ul>
              )}

              {/* 선택된 챔피언 미리보기 */}
              {formData.championId && (
                <div className="mt-3 position-relative rounded overflow-hidden shadow" style={{ height: '200px' }}>
                  <img 
                    src={`https://ddragon.leagueoflegends.com/cdn/img/champion/splash/${formData.championId}_${formData.skinId}.jpg`} 
                    alt="Splash" 
                    className="w-100 h-100"
                    style={{ objectFit: 'cover', objectPosition: 'top' }}
                  />
                  <div className="position-absolute bottom-0 start-0 w-100 bg-black bg-opacity-50 p-2">
                    <h3 className="m-0 fw-bold ps-2">{champSearch}</h3>
                  </div>
                </div>
              )}
            </div>

            {/* 2. 포지션 선택 */}
            <div className="col-md-5">
              <label className="form-label fw-bold text-warning">포지션 선택</label>
              <div className="d-flex justify-content-between gap-2 bg-secondary bg-opacity-25 p-3 rounded border border-secondary">
                {positions.map(pos => (
                  <div 
                    key={pos.key} 
                    className={`text-center p-2 rounded cursor-pointer transition ${formData.position === pos.key ? 'bg-primary bg-opacity-50 border border-primary' : ''}`}
                    style={{ cursor: 'pointer', flex: 1 }}
                    onClick={() => setFormData({ ...formData, position: pos.key })}
                  >
                    <img src={pos.icon} alt={pos.name} style={{ width: '40px', filter: formData.position === pos.key ? 'brightness(1.2)' : 'grayscale(100%)' }} />
                    <div className="small mt-1 text-light">{pos.name}</div>
                  </div>
                ))}
              </div>
            </div>

            {/* 3. 스킨 선택 */}
            {selectedChampDetail && (
              <div className="col-12">
                <label className="form-label fw-bold text-warning">스킨 선택</label>
                <div className="d-flex gap-3 overflow-auto pb-3 custom-scrollbar" style={{ whiteSpace: 'nowrap' }}>
                  {selectedChampDetail.skins.map(skin => (
                    <div 
                      key={skin.id} 
                      className={`d-inline-block rounded overflow-hidden position-relative border ${formData.skinId == skin.num ? 'border-warning border-3' : 'border-secondary'}`}
                      style={{ minWidth: '120px', width: '120px', cursor: 'pointer' }}
                      onClick={() => setFormData({ ...formData, skinId: skin.num })}
                    >
                      <img 
                        src={`https://ddragon.leagueoflegends.com/cdn/img/champion/loading/${formData.championId}_${skin.num}.jpg`} 
                        alt={skin.name}
                        className="w-100"
                        style={{ filter: formData.skinId == skin.num ? 'none' : 'brightness(60%)' }}
                      />
                      <div className="text-center small text-white text-truncate p-1 bg-black bg-opacity-75">
                        {skin.name === 'default' ? '기본' : skin.name}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* --- 섹션 2: 인게임 설정 --- */}
      <div className="row g-4">
        <div className="col-lg-6">
           <div className="card bg-dark text-white border-secondary h-100">
             <div className="card-header border-secondary fw-bold text-warning">인게임 설정</div>
             <div className="card-body">
               {/* 스펠 */}
               <div className="row mb-3">
                 <div className="col-6">
                   <label className="small text-muted mb-1">스펠 D</label>
                   <div className="d-flex align-items-center">
                     {formData.spell1 && <img src={`https://ddragon.leagueoflegends.com/cdn/${version}/img/spell/${formData.spell1}.png`} width="40" className="me-2 rounded"/>}
                     <select className="form-select form-select-sm bg-dark text-white border-secondary" name="spell1" value={formData.spell1} onChange={handleChange}>
                       <option value="">선택</option>
                       {spells.map(s => <option key={s.id} value={s.id} disabled={s.id === formData.spell2}>{s.name}</option>)}
                     </select>
                   </div>
                 </div>
                 <div className="col-6">
                   <label className="small text-muted mb-1">스펠 F</label>
                   <div className="d-flex align-items-center">
                     {formData.spell2 && <img src={`https://ddragon.leagueoflegends.com/cdn/${version}/img/spell/${formData.spell2}.png`} width="40" className="me-2 rounded"/>}
                     <select className="form-select form-select-sm bg-dark text-white border-secondary" name="spell2" value={formData.spell2} onChange={handleChange}>
                       <option value="">선택</option>
                       {spells.map(s => <option key={s.id} value={s.id} disabled={s.id === formData.spell1}>{s.name}</option>)}
                     </select>
                   </div>
                 </div>
               </div>

               {/* 스킬 */}
               <div className="mb-3">
                 <label className="small text-muted mb-1">스킬 선마</label>
                 <select className="form-select bg-dark text-white border-secondary" name="skillOrder" value={formData.skillOrder} onChange={handleChange}>
                    <option value="Q>W>E">{'Q > W > E'}</option>
                    <option value="Q>E>W">{'Q > E > W'}</option>
                    <option value="W>Q>E">{'W > Q > E'}</option>
                    <option value="W>E>Q">{'W > E > Q'}</option>
                    <option value="E>Q>W">{'E > Q > W'}</option>
                    <option value="E>W>Q">{'E > W > Q'}</option>
                 </select>
               </div>

               {/* 룬 */}
               <div className="mb-3">
                 <label className="small text-muted mb-2">룬 빌드 선택</label>
                 <div className="d-flex flex-wrap gap-2">
                   {runes.map(r => (
                     <div 
                        key={r.id} 
                        onClick={() => handleRuneStyleChange(r.id)}
                        className={`rounded-circle p-1 border ${formData.runeStyle == r.id ? 'border-warning border-2' : 'border-secondary'}`}
                        style={{ cursor: 'pointer', transition: '0.2s' }}
                     >
                       <img 
                          src={`https://ddragon.leagueoflegends.com/cdn/img/${r.icon}`} 
                          width="40" 
                          height="40"
                          alt={r.name}
                          title={r.name}
                          style={{ filter: formData.runeStyle == r.id ? 'none' : 'grayscale(100%) opacity(0.5)' }}
                       />
                     </div>
                   ))}
                 </div>
               </div>

               {/* 핵심 룬 (빌드 선택 시에만 표시) */}
               {formData.runeStyle && (
                 <div className="mb-2">
                   <label className="small text-muted mb-2">핵심 룬 선택</label>
                   <div className="d-flex flex-wrap gap-2 p-2 bg-black bg-opacity-25 rounded">
                     {keystoneList.map(k => (
                       <div 
                          key={k.id} 
                          onClick={() => handleRuneCoreChange(k.id)}
                          className={`rounded-circle p-1 border ${formData.runeCore == k.id ? 'border-warning border-2' : 'border-secondary'}`}
                          style={{ cursor: 'pointer', transition: '0.2s' }}
                       >
                         <img 
                            src={`https://ddragon.leagueoflegends.com/cdn/img/${k.icon}`} 
                            width="50" 
                            height="50"
                            alt={k.name}
                            title={k.name}
                            style={{ filter: formData.runeCore == k.id ? 'none' : 'grayscale(100%) opacity(0.5)' }}
                         />
                       </div>
                     ))}
                   </div>
                 </div>
               )}
             </div>
           </div>
        </div>

        {/* --- 섹션 3: 아이템 빌드 --- */}
        <div className="col-lg-6">
          <div className="card bg-dark text-white border-secondary h-100">
             <div className="card-header border-secondary fw-bold text-warning">아이템 빌드 (최대 6개)</div>
             <div className="card-body">
               {/* 선택된 아이템 */}
               <div className="d-flex gap-2 mb-3 p-3 bg-black bg-opacity-25 rounded border border-secondary" style={{ minHeight: '80px' }}>
                 {formData.itemBuild.length === 0 && <span className="text-muted small align-self-center">아이템을 추가하세요.</span>}
                 {formData.itemBuild.map((id, idx) => (
                   <div key={idx} className="position-relative" onClick={() => handleItemRemove(idx)} style={{ cursor: 'pointer' }}>
                     <img src={`https://ddragon.leagueoflegends.com/cdn/${version}/img/item/${id}.png`} 
                          className="rounded border border-secondary" style={{width: 50, height: 50}} alt="item" />
                     <div className="position-absolute top-0 end-0 bg-danger rounded-circle p-1" style={{ width: 10, height: 10, border: '1px solid white' }}></div>
                   </div>
                 ))}
               </div>

               {/* 아이템 검색 */}
               <input 
                 type="text" 
                 className="form-control bg-dark text-white border-secondary mb-2" 
                 placeholder="아이템 검색" 
                 onChange={(e) => setItemSearch(e.target.value)} 
               />
               <div className="d-flex flex-wrap gap-1 p-2 custom-scrollbar" style={{maxHeight: '200px', overflowY: 'auto'}}>
                 {items
                   .filter(i => i.name.includes(itemSearch) && itemSearch.length > 0)
                   .map(item => (
                     <img 
                       key={item.image.full} 
                       src={`https://ddragon.leagueoflegends.com/cdn/${version}/img/item/${item.image.full}`}
                       style={{width: 45, cursor: 'pointer', border: '1px solid #444'}} 
                       className="rounded hover-effect"
                       title={item.name}
                       onClick={() => handleItemAdd(item.image.full.replace('.png', ''))}
                       alt={item.name}
                     />
                 ))}
               </div>
             </div>
          </div>
        </div>
      </div>

      <div className="mt-4 d-flex gap-2">
        <button className="btn btn-secondary flex-grow-1 btn-lg fw-bold" onClick={() => navigate(-1)}>취소</button>
        <button className="btn btn-primary flex-grow-1 btn-lg fw-bold shadow-sm" onClick={handleUpdate}>
          수정 완료
        </button>
      </div>
    </div>
  );
};

export default Update;