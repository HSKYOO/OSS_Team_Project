import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

const Create = () => {
  const navigate = useNavigate();
  
  // 데이터셋 State ---
  const [version, setVersion] = useState('');
  const [champions, setChampions] = useState([]);
  const [items, setItems] = useState([]);
  const [spells, setSpells] = useState([]);
  const [runes, setRunes] = useState([]);
  
  // 폼 데이터 & 선택 State ---
  const [formData, setFormData] = useState({
    championId: '',
    position: 'TOP',
    skinId: '0', // 기본 스킨 '0'
    spell1: '',
    spell2: '',
    skillOrder: 'Q>W>E',
    runeStyle: '',
    runeCore: '',
    itemBuild: []
  });

  const [selectedChampDetail, setSelectedChampDetail] = useState(null); // 스킨 목록용 상세 데이터

  // 검색 및 UI 제어 State ---
  const [champSearch, setChampSearch] = useState('');      // 챔피언 검색어
  const [champSuggestions, setChampSuggestions] = useState([]); // 챔피언 자동완성 목록
  const [showChampDropdown, setShowChampDropdown] = useState(false); // 드롭다운 표시 여부
  const [itemSearch, setItemSearch] = useState(''); // 아이템 검색어

  // 포지션 아이콘 (CommunityDragon 활용)
  const positions = [
    { key: 'TOP', name: '탑', icon: 'https://raw.communitydragon.org/latest/plugins/rcp-fe-lol-clash/global/default/assets/images/position-selector/positions/icon-position-top.png' },
    { key: 'JUNGLE', name: '정글', icon: 'https://raw.communitydragon.org/latest/plugins/rcp-fe-lol-clash/global/default/assets/images/position-selector/positions/icon-position-jungle.png' },
    { key: 'MIDDLE', name: '미드', icon: 'https://raw.communitydragon.org/latest/plugins/rcp-fe-lol-clash/global/default/assets/images/position-selector/positions/icon-position-middle.png' },
    { key: 'BOTTOM', name: '원딜', icon: 'https://raw.communitydragon.org/latest/plugins/rcp-fe-lol-clash/global/default/assets/images/position-selector/positions/icon-position-bottom.png' },
    { key: 'UTILITY', name: '서폿', icon: 'https://raw.communitydragon.org/latest/plugins/rcp-fe-lol-clash/global/default/assets/images/position-selector/positions/icon-position-utility.png' },
  ];

  // 초기 데이터 로딩 ---
  useEffect(() => {
    const fetchData = async () => {
      try {
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
        setChampions(Object.values(cJson.data).sort((a, b) => a.name.localeCompare(b.name, 'ko')));
        
        // 아이템 필터링 (중복 제거)
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

        // 스펠 필터링
        setSpells(Object.values(sJson.data).filter(spell => spell.modes.includes("CLASSIC")));
        
        // 룬 설정
        setRunes(rJson);

      } catch (err) {
        console.error("데이터 로딩 실패:", err);
      }
    };
    fetchData();
  }, []);

  // 챔피언 상세 정보(스킨) 가져오기 ---
  useEffect(() => {
    if (formData.championId && version) {
      const fetchSkin = async () => {
        const res = await fetch(`https://ddragon.leagueoflegends.com/cdn/${version}/data/ko_KR/champion/${formData.championId}.json`);
        const json = await res.json();
        setSelectedChampDetail(json.data[formData.championId]);
        setFormData(prev => ({ ...prev, skinId: '0' })); // 챔피언 바뀌면 스킨 초기화
      };
      fetchSkin();
    }
  }, [formData.championId, version]);


  // 챔피언 검색 로직 (자동완성) ---
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
    setFormData({ ...formData, championId: champ.id });
    setChampSearch(champ.name); // 검색창에 이름 채움
    setShowChampDropdown(false); // 드롭다운 닫기
  };


  // --- 7. 일반 핸들러 ---
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

  const handleSave = () => {
    if (!formData.championId) return alert("챔피언을 선택해주세요.");
    const savedList = JSON.parse(localStorage.getItem('myBuilds')) || [];
    const newBuild = { ...formData, id: Date.now(), version };
    localStorage.setItem('myBuilds', JSON.stringify([...savedList, newBuild]));
    alert("챔피언 빌드가 저장되었습니다!");
    navigate('/myinfo');
  }

  const selectedRuneStyle = runes.find(r => r.id == formData.runeStyle);
  const keystoneList = selectedRuneStyle ? selectedRuneStyle.slots[0].runes : [];

  return (
    <div className="container py-4">
      <h2 className="fw-bold mb-4 text-white">챔피언 빌드 생성</h2>
      
      {/* --- 섹션 1: 챔피언 & 포지션 선택 --- */}
      <div className="card bg-dark text-white mb-4 shadow-lg border-secondary">
        <div className="card-body p-4">
          <div className="row g-4">
            
            {/* 1. 챔피언 검색 (이미지 드롭다운) */}
            <div className="col-md-7 position-relative">
              <label className="form-label fw-bold text-warning">챔피언 선택</label>
              <div className="input-group input-group-lg">
                <span className="input-group-text bg-secondary text-white border-0">🔍</span>
                <input 
                  type="text" 
                  className="form-control bg-dark text-white border-secondary"
                  placeholder="챔피언 검색 (예: 아리, garen)"
                  value={champSearch}
                  onChange={handleChampSearch}
                  onFocus={() => setShowChampDropdown(true)}
                  // onBlur -> setTimeout을 줘야 클릭 이벤트가 씹히지 않음 (생략 가능하나 UX위해 주의)
                />
              </div>

              {/* 드롭다운 리스트 */}
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

              {/* 선택된 챔피언 미리보기 (크게) */}
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

            {/* 2. 포지션 선택 (아이콘 버튼) */}
            <div className="col-md-5">
              <label className="form-label fw-bold text-warning">포지션 선택</label>
              <div className="d-flex justify-content-between gap-2 bg-secondary bg-opacity-25 p-3 rounded border border-secondary">
                {positions.map(pos => (
                  <div 
                    key={pos.key} 
                    className={`text-center p-2 rounded cursor-pointer transition ${formData.position === pos.key ? 'bg-primary bg-opacity-50 border border-primary' : 'hover-effect'}`}
                    style={{ cursor: 'pointer', flex: 1 }}
                    onClick={() => setFormData({ ...formData, position: pos.key })}
                  >
                    <img src={pos.icon} alt={pos.name} style={{ width: '40px', filter: formData.position === pos.key ? 'brightness(1.2)' : 'grayscale(100%)' }} />
                    <div className="small mt-1 text-light">{pos.name}</div>
                  </div>
                ))}
              </div>
            </div>

            {/* 3. 스킨 선택 (가로 스크롤 카드) */}
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


      {/* --- 섹션 2: 인게임 설정 (스펠, 룬, 스킬) --- */}
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
               {/* 선택된 아이템 리스트 */}
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
                  placeholder="아이템 취소를 원하면 아이템 클릭" 
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

      <div className="mt-4">
        <button className="btn btn-primary w-100 btn-lg fw-bold shadow-sm" onClick={handleSave}>
          빌드 생성하기
        </button>
      </div>
    </div>
  );
};

export default Create;