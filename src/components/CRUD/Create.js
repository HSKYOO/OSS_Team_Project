import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

const Create = () => {
  const navigate = useNavigate();
  
  // --- 데이터셋 State ---
  const [version, setVersion] = useState('');
  const [champions, setChampions] = useState([]);
  const [items, setItems] = useState([]);
  const [spells, setSpells] = useState([]);
  const [runes, setRunes] = useState([]);
  
  // --- 폼 데이터 & 선택 State ---
  const [formData, setFormData] = useState({
    championId: '',
    position: 'TOP',
    skinId: '0',
    spell1: '',
    spell2: '',
    skillOrder: 'Q>W>E',
    // 핵심 룬
    runeStyle: '',     
    runeCore: '',      
    runeSlot1: '',     
    runeSlot2: '',     
    runeSlot3: '',
    // 보조 룬
    runeSubStyle: '',
    runeSubSlot1: '',
    runeSubSlot2: '',
    runeSubSlot3: '', 
    // 파편 삭제됨
    itemBuild: []
  });

  const [selectedChampDetail, setSelectedChampDetail] = useState(null);

  // --- 검색 및 UI 제어 State ---
  const [champSearch, setChampSearch] = useState('');
  const [champSuggestions, setChampSuggestions] = useState([]);
  const [showChampDropdown, setShowChampDropdown] = useState(false);
  const [itemSearch, setItemSearch] = useState('');

  // --- 기타 데이터 (포지션) ---
  const positions = [
    { key: 'TOP', name: '탑', icon: 'https://raw.communitydragon.org/latest/plugins/rcp-fe-lol-clash/global/default/assets/images/position-selector/positions/icon-position-top.png' },
    { key: 'JUNGLE', name: '정글', icon: 'https://raw.communitydragon.org/latest/plugins/rcp-fe-lol-clash/global/default/assets/images/position-selector/positions/icon-position-jungle.png' },
    { key: 'MIDDLE', name: '미드', icon: 'https://raw.communitydragon.org/latest/plugins/rcp-fe-lol-clash/global/default/assets/images/position-selector/positions/icon-position-middle.png' },
    { key: 'BOTTOM', name: '원딜', icon: 'https://raw.communitydragon.org/latest/plugins/rcp-fe-lol-clash/global/default/assets/images/position-selector/positions/icon-position-bottom.png' },
    { key: 'UTILITY', name: '서폿', icon: 'https://raw.communitydragon.org/latest/plugins/rcp-fe-lol-clash/global/default/assets/images/position-selector/positions/icon-position-utility.png' },
  ];

  // --- 초기 데이터 로딩 ---
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

        setChampions(Object.values(cJson.data).sort((a, b) => a.name.localeCompare(b.name, 'ko')));
        
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
      }
    };
    fetchData();
  }, []);

  // --- 챔피언 상세 정보 로딩 ---
  useEffect(() => {
    if (formData.championId && version) {
      const fetchSkin = async () => {
        const res = await fetch(`https://ddragon.leagueoflegends.com/cdn/${version}/data/ko_KR/champion/${formData.championId}.json`);
        const json = await res.json();
        setSelectedChampDetail(json.data[formData.championId]);
        setFormData(prev => ({ ...prev, skinId: '0' }));
      };
      fetchSkin();
    }
  }, [formData.championId, version]);

  // --- 이벤트 핸들러 ---
  const handleChampSearch = (e) => {
    const input = e.target.value;
    setChampSearch(input);
    setShowChampDropdown(true);
    if (input.trim() === '') { setChampSuggestions([]); return; }
    setChampSuggestions(champions.filter(c => c.name.includes(input) || c.id.toLowerCase().includes(input.toLowerCase())));
  };

  const selectChampion = (champ) => {
    setFormData({ ...formData, championId: champ.id });
    setChampSearch(champ.name);
    setShowChampDropdown(false);
  };

  const handleChange = (e) => setFormData({ ...formData, [e.target.name]: e.target.value });

  const handleItemAdd = (itemId) => {
    if (formData.itemBuild.length >= 6) return alert("아이템은 최대 6개입니다.");
    setFormData({ ...formData, itemBuild: [...formData.itemBuild, itemId] });
  };

  const handleItemRemove = (index) => {
    setFormData({ ...formData, itemBuild: formData.itemBuild.filter((_, i) => i !== index) });
  }

  // --- 스펠 선택 핸들러 (이미지 클릭용) ---
  const handleSpellSelect = (slot, spellId) => {
    setFormData(prev => ({ ...prev, [slot]: spellId }));
  };

  // 핵심 룬 스타일 변경
  const handleRuneStyleChange = (styleId) => {
    setFormData({ 
      ...formData, 
      runeStyle: styleId, runeCore: '', runeSlot1: '', runeSlot2: '', runeSlot3: '', 
      runeSubStyle: '', runeSubSlot1: '', runeSubSlot2: '', runeSubSlot3: '' 
    });
  };
  const handleRuneCoreChange = (coreId) => setFormData({ ...formData, runeCore: coreId });
  const handleRuneSubChange = (slotIndex, runeId) => setFormData(prev => ({ ...prev, [`runeSlot${slotIndex}`]: runeId }));

  // 보조 룬 스타일 변경
  const handleRuneSubStyleChange = (styleId) => {
    setFormData({ ...formData, runeSubStyle: styleId, runeSubSlot1: '', runeSubSlot2: '', runeSubSlot3: '' });
  };

  // 보조 룬 3줄 중 2개 선택 (FIFO 방식)
  const handleRuneSubSlotChange = (clickedSlotIdx, runeId) => {
    const currentSlots = {
      1: formData.runeSubSlot1,
      2: formData.runeSubSlot2,
      3: formData.runeSubSlot3
    };

    if (currentSlots[clickedSlotIdx]) {
      setFormData({ ...formData, [`runeSubSlot${clickedSlotIdx}`]: runeId });
      return;
    }

    const activeRows = [1, 2, 3].filter(idx => currentSlots[idx] !== '');

    if (activeRows.length < 2) {
      setFormData({ ...formData, [`runeSubSlot${clickedSlotIdx}`]: runeId });
    } else {
      const rowToRemove = activeRows[0];
      setFormData({
        ...formData,
        [`runeSubSlot${rowToRemove}`]: '',      
        [`runeSubSlot${clickedSlotIdx}`]: runeId 
      });
    }
  };

  const handleSave = () => {
    if (!formData.championId) return alert("챔피언을 선택해주세요.");
    const savedList = JSON.parse(localStorage.getItem('myBuilds')) || [];
    const newBuild = { ...formData, id: Date.now(), version };
    localStorage.setItem('myBuilds', JSON.stringify([...savedList, newBuild]));
    alert("챔피언 빌드가 저장되었습니다!");
    navigate('/myinfo');
  }

  // == 대신 === 사용 (타입 불일치 방지를 위해 String() 변환 후 비교)
  const selectedRuneStyleObj = runes.find(r => String(r.id) === String(formData.runeStyle));
  const selectedSubRuneStyleObj = runes.find(r => String(r.id) === String(formData.runeSubStyle));

  // 룬 아이콘 공통 스타일
  const runeIconStyle = (isSelected, isKeystone = false) => ({
    cursor: 'pointer', 
    transition: 'all 0.2s',
    filter: isSelected ? 'none' : 'grayscale(100%) opacity(0.3)',
    border: isSelected ? '2px solid #ffc107' : '2px solid transparent',
    borderRadius: '50%',
    width: isKeystone ? '50px' : '40px',
    height: isKeystone ? '50px' : '40px',
    padding: '2px',
    transform: isSelected ? 'scale(1.1)' : 'scale(1)'
  });

  // [추가] 스펠 아이콘 스타일
  const spellIconStyle = (isSelected, isDisabled) => ({
    width: '40px',
    height: '40px',
    cursor: isDisabled ? 'not-allowed' : 'pointer',
    borderRadius: '4px',
    border: isSelected ? '2px solid #ffc107' : '1px solid #444',
    filter: isDisabled ? 'grayscale(100%) opacity(0.2)' : (isSelected ? 'none' : 'grayscale(100%) opacity(0.5)'),
    transition: 'all 0.2s'
  });

  return (
    <div className="container py-4">
      <h2 className="fw-bold mb-4 text-white">챔피언 빌드 생성</h2>
      
      {/* --- 섹션 1: 챔피언 & 포지션 & 스킨 --- */}
      <div className="card bg-dark text-white mb-4 shadow-lg border-secondary">
        <div className="card-body p-4">
          <div className="row g-4">
            {/* 챔피언 검색 */}
            <div className="col-md-7 position-relative">
              <label className="form-label fw-bold text-warning">챔피언 선택</label>
              <div className="input-group input-group-lg">
                <span className="input-group-text bg-secondary text-white border-0">🔍</span>
                <input type="text" className="form-control bg-dark text-white border-secondary" placeholder="챔피언 검색" value={champSearch} onChange={handleChampSearch} onFocus={() => setShowChampDropdown(true)} />
              </div>
              {showChampDropdown && champSuggestions.length > 0 && (
                <ul className="list-group position-absolute w-100 shadow-lg mt-1 custom-scrollbar" style={{ zIndex: 1000, maxHeight: '300px', overflowY: 'auto' }}>
                  {champSuggestions.map(c => (
                    <li key={c.id} className="list-group-item list-group-item-action bg-dark text-white border-secondary d-flex align-items-center" style={{ cursor: 'pointer' }} onClick={() => selectChampion(c)}>
                      <img src={`https://ddragon.leagueoflegends.com/cdn/${version}/img/champion/${c.image.full}`} alt={c.name} className="rounded-circle me-3 border border-secondary" width="40" height="40"/>
                      <span>{c.name}</span>
                    </li>
                  ))}
                </ul>
              )}
               {formData.championId && (
                <div className="mt-3 position-relative rounded overflow-hidden shadow" style={{ height: '200px' }}>
                  <img src={`https://ddragon.leagueoflegends.com/cdn/img/champion/splash/${formData.championId}_${formData.skinId}.jpg`} alt="Splash" className="w-100 h-100" style={{ objectFit: 'cover', objectPosition: 'top' }} />
                  <div className="position-absolute bottom-0 start-0 w-100 bg-black bg-opacity-50 p-2"><h3 className="m-0 fw-bold ps-2">{champSearch}</h3></div>
                </div>
              )}
            </div>
            {/* 포지션 선택 */}
            <div className="col-md-5">
              <label className="form-label fw-bold text-warning">포지션 선택</label>
              <div className="d-flex justify-content-between gap-2 bg-secondary bg-opacity-25 p-3 rounded border border-secondary">
                {positions.map(pos => (
                  <div key={pos.key} className={`text-center p-2 rounded cursor-pointer transition ${formData.position === pos.key ? 'bg-primary bg-opacity-50 border border-primary' : 'hover-effect'}`}
                    style={{ cursor: 'pointer', flex: 1 }} onClick={() => setFormData({ ...formData, position: pos.key })}>
                    <img src={pos.icon} alt={pos.name} style={{ width: '40px', filter: formData.position === pos.key ? 'brightness(1.2)' : 'grayscale(100%)' }} />
                    <div className="small mt-1 text-light">{pos.name}</div>
                  </div>
                ))}
              </div>
            </div>
            {/* 스킨 선택 */}
            {selectedChampDetail && (
              <div className="col-12">
                <label className="form-label fw-bold text-warning">스킨 선택</label>
                <div className="d-flex gap-3 overflow-auto pb-3 custom-scrollbar" style={{ whiteSpace: 'nowrap' }}>
                  {selectedChampDetail.skins.map(skin => (
                    <div key={skin.id} className={`d-inline-block rounded overflow-hidden position-relative border ${String(formData.skinId) === String(skin.num) ? 'border-warning border-3' : 'border-secondary'}`}
                      style={{ minWidth: '120px', width: '120px', cursor: 'pointer' }} onClick={() => setFormData({ ...formData, skinId: skin.num })}>
                      <img src={`https://ddragon.leagueoflegends.com/cdn/img/champion/loading/${formData.championId}_${skin.num}.jpg`} alt={skin.name} className="w-100" style={{ filter: String(formData.skinId) === String(skin.num) ? 'none' : 'brightness(60%)' }} />
                      <div className="text-center small text-white text-truncate p-1 bg-black bg-opacity-75">{skin.name === 'default' ? '기본' : skin.name}</div>
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
        <div className="col-lg-12">
           <div className="card bg-dark text-white border-secondary h-100">
             <div className="card-header border-secondary fw-bold text-warning">인게임 설정</div>
             <div className="card-body">
               
               {/* 스펠 & 스킬 (드롭다운 -> 이미지 선택으로 변경됨) */}
               <div className="row mb-4">
                 <div className="col-md-7">
                    <label className="small text-muted mb-2 fw-bold">스펠 선택</label>
                    <div className="row g-2">
                      {/* D 스펠 선택 영역 */}
                      <div className="col-6">
                        <div className="p-2 border border-secondary rounded bg-black bg-opacity-25">
                          <div className="small text-warning mb-2 text-center">D 스펠</div>
                          <div className="d-flex flex-wrap gap-2 justify-content-center">
                            {spells.map(s => {
                               const isSelected = String(formData.spell1) === String(s.id);
                               const isDisabled = String(formData.spell2) === String(s.id); // F스펠과 중복 방지
                               return (
                                 <img 
                                    key={s.id} 
                                    src={`https://ddragon.leagueoflegends.com/cdn/${version}/img/spell/${s.id}.png`} 
                                    alt={s.name} 
                                    title={s.name}
                                    onClick={() => !isDisabled && handleSpellSelect('spell1', s.id)}
                                    style={spellIconStyle(isSelected, isDisabled)}
                                 />
                               );
                            })}
                          </div>
                        </div>
                      </div>

                      {/* F 스펠 선택 영역 */}
                      <div className="col-6">
                        <div className="p-2 border border-secondary rounded bg-black bg-opacity-25">
                          <div className="small text-warning mb-2 text-center">F 스펠</div>
                          <div className="d-flex flex-wrap gap-2 justify-content-center">
                            {spells.map(s => {
                               const isSelected = String(formData.spell2) === String(s.id);
                               const isDisabled = String(formData.spell1) === String(s.id); // D스펠과 중복 방지
                               return (
                                 <img 
                                    key={s.id} 
                                    src={`https://ddragon.leagueoflegends.com/cdn/${version}/img/spell/${s.id}.png`} 
                                    alt={s.name} 
                                    title={s.name}
                                    onClick={() => !isDisabled && handleSpellSelect('spell2', s.id)}
                                    style={spellIconStyle(isSelected, isDisabled)}
                                 />
                               );
                            })}
                          </div>
                        </div>
                      </div>
                    </div>
                 </div>

                 {/* 스킬 빌드 */}
                 <div className="col-md-5 d-flex flex-column">
                   <label className="small text-muted mb-2 fw-bold">스킬 빌드</label>
                   <div className="p-3 border border-secondary rounded bg-black bg-opacity-25 flex-grow-1 d-flex align-items-center">
                     <select className="form-select bg-dark text-white border-secondary" name="skillOrder" value={formData.skillOrder} onChange={handleChange}>
                        <option value="Q>W>E">{'Q > W > E'}</option>
                        <option value="Q>E>W">{'Q > E > W'}</option>
                        <option value="W>Q>E">{'W > Q > E'}</option>
                        <option value="W>E>Q">{'W > E > Q'}</option>
                        <option value="E>Q>W">{'E > Q > W'}</option>
                        <option value="E>W>Q">{'E > W > Q'}</option>
                     </select>
                   </div>
                 </div>
               </div>

               <hr className="border-secondary my-4"/>

               {/* --- 룬 설정 --- */}
               <div className="row g-4">
                 {/* === 왼쪽: 핵심 룬 빌드 === */}
                 <div className="col-md-6 border-end border-secondary pe-4">
                   <h5 className="fw-bold text-warning mb-3">핵심 룬 빌드</h5>
                   
                   {/* 스타일 선택 */}
                   <div className="d-flex gap-3 mb-4 justify-content-center">
                     {runes.map(r => (
                       <img key={r.id} 
                         src={`https://ddragon.leagueoflegends.com/cdn/img/${r.icon}`} 
                         alt={r.name} title={r.name}
                         onClick={() => handleRuneStyleChange(r.id)}
                         style={runeIconStyle(String(formData.runeStyle) === String(r.id), true)} />
                     ))}
                   </div>

                   {/* 상세 룬 */}
                   {selectedRuneStyleObj && (
                     <div className="d-flex flex-column gap-4 align-items-center">
                       {/* 핵심 룬 */}
                       <div className="d-flex gap-4 p-2 bg-black bg-opacity-25 rounded-pill">
                         {selectedRuneStyleObj.slots[0].runes.map(k => (
                           <img key={k.id} 
                             src={`https://ddragon.leagueoflegends.com/cdn/img/${k.icon}`} 
                             alt={k.name} title={k.name}
                             onClick={() => handleRuneCoreChange(k.id)}
                             style={runeIconStyle(String(formData.runeCore) === String(k.id), true)} />
                         ))}
                       </div>
                       
                       {/* 하위 룬 */}
                       {selectedRuneStyleObj.slots.slice(1).map((slot, idx) => {
                         const slotNum = idx + 1;
                         const currentVal = formData[`runeSlot${slotNum}`];
                         return (
                           <div key={idx} className="d-flex gap-4">
                             {slot.runes.map(rune => (
                               <img key={rune.id} 
                                 src={`https://ddragon.leagueoflegends.com/cdn/img/${rune.icon}`} 
                                 alt={rune.name} title={rune.name}
                                 onClick={() => handleRuneSubChange(slotNum, rune.id)}
                                 style={runeIconStyle(String(currentVal) === String(rune.id))} />
                             ))}
                           </div>
                         );
                       })}
                     </div>
                   )}
                 </div>

                 {/* === 오른쪽: 보조 룬 === */}
                 <div className="col-md-6 ps-4">
                    <h5 className="fw-bold text-warning mb-3">보조 룬 빌드</h5>
                    
                    {/* 보조 스타일 선택 */}
                    <div className="d-flex gap-3 mb-4 justify-content-center">
                      {runes.filter(r => String(r.id) !== String(formData.runeStyle)).map(r => (
                        <img key={r.id} 
                           src={`https://ddragon.leagueoflegends.com/cdn/img/${r.icon}`} 
                           alt={r.name} title={r.name}
                           onClick={() => handleRuneSubStyleChange(r.id)}
                           style={runeIconStyle(String(formData.runeSubStyle) === String(r.id), true)} />
                      ))}
                    </div>

                    {/* 보조 하위 룬 3줄 */}
                    {selectedSubRuneStyleObj && (
                      <div className="d-flex flex-column gap-4 align-items-center">
                        {selectedSubRuneStyleObj.slots.slice(1).map((slot, idx) => {
                          const slotNum = idx + 1; 
                          const currentVal = formData[`runeSubSlot${slotNum}`];
                          const isActiveRow = currentVal !== '';
                          
                          // 2줄 선택되면 나머지는 흐리게 처리
                          const activeRowCount = [1, 2, 3].filter(n => formData[`runeSubSlot${n}`] !== '').length;
                          const isDimmed = !isActiveRow && activeRowCount >= 2;

                          return (
                            <div key={idx} className="d-flex gap-4 p-1 rounded transition" 
                                 style={{ 
                                   opacity: isDimmed ? 0.3 : 1, 
                                 }}>
                              {slot.runes.map(rune => (
                                <img key={rune.id} 
                                  src={`https://ddragon.leagueoflegends.com/cdn/img/${rune.icon}`} 
                                  alt={rune.name} title={rune.name}
                                  onClick={() => handleRuneSubSlotChange(slotNum, rune.id)}
                                  style={runeIconStyle(String(currentVal) === String(rune.id))} />
                              ))}
                            </div>
                          );
                        })}
                      </div>
                    )}
                 </div>
               </div>
               {/* --- 룬 설정 끝 --- */}

             </div>
           </div>
        </div>

        {/* --- 섹션 3: 아이템 빌드 --- */}
        <div className="col-lg-12">
          <div className="card bg-dark text-white border-secondary h-100">
              <div className="card-header border-secondary fw-bold text-warning">아이템 빌드 (최대 6개)</div>
              <div className="card-body">
                <div className="d-flex gap-2 mb-3 p-3 bg-black bg-opacity-25 rounded border border-secondary" style={{ minHeight: '80px' }}>
                  {formData.itemBuild.length === 0 && <span className="text-muted small align-self-center">아이템을 추가하세요.</span>}
                  {formData.itemBuild.map((id, idx) => (
                    <div key={idx} className="position-relative" onClick={() => handleItemRemove(idx)} style={{ cursor: 'pointer' }}>
                      <img src={`https://ddragon.leagueoflegends.com/cdn/${version}/img/item/${id}.png`} className="rounded border border-secondary" style={{width: 50, height: 50}} alt="item" />
                      <div className="position-absolute top-0 end-0 bg-danger rounded-circle p-1" style={{ width: 10, height: 10, border: '1px solid white' }}></div>
                    </div>
                  ))}
                </div>
                <input type="text" className="form-control bg-dark text-white border-secondary mb-2" placeholder="아이템 검색 (클릭하여 추가)" onChange={(e) => setItemSearch(e.target.value)} />
                <div className="d-flex flex-wrap gap-1 p-2 custom-scrollbar" style={{maxHeight: '200px', overflowY: 'auto'}}>
                  {items.filter(i => i.name.includes(itemSearch) && itemSearch.length > 0).map(item => (
                      <img key={item.image.full} src={`https://ddragon.leagueoflegends.com/cdn/${version}/img/item/${item.image.full}`}
                        style={{width: 45, cursor: 'pointer', border: '1px solid #444'}} className="rounded hover-effect" title={item.name}
                        onClick={() => handleItemAdd(item.image.full.replace('.png', ''))} alt={item.name} />
                  ))}
                </div>
              </div>
          </div>
        </div>
      </div>

      <div className="mt-4">
        <button className="btn btn-primary w-100 btn-lg fw-bold shadow-sm" onClick={handleSave}>빌드 생성하기</button>
      </div>
    </div>
  );
};

export default Create;