// src/components/CRUD/Create.js
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

const Create = () => {
  const navigate = useNavigate(); // 네비게이션 훅 생성
  const [version, setVersion] = useState('');
  const [champions, setChampions] = useState([]);
  const [items, setItems] = useState([]);
  const [spells, setSpells] = useState([]); 
  const [runes, setRunes] = useState([]);
  
  // 선택된 챔피언의 상세 정보 (스킨 로딩용)
  const [selectedChampDetail, setSelectedChampDetail] = useState(null);

  // --- 2. 사용자 입력 Form State (7가지 데이터) ---
  const [formData, setFormData] = useState({
    championId: '',       // 챔피언
    position: 'TOP',      // 포지션
    skinId: '',           // 스킨
    spell1: '',           // 스펠 D
    spell2: '',           // 스펠 F
    skillOrder: 'Q>W>E',  // 스킬 마스터리
    runeStyle: '',        // 룬 (메인 빌드)
    runeCore: '',         // 룬 (핵심 빌드)
    itemBuild: []         // 아이템 (최대 6개)
  });

  // 아이템 선택을 위한 임시 State
  const [itemSearch, setItemSearch] = useState('');

  // --- 3. 초기 데이터 로딩 ---
  useEffect(() => {
    const fetchData = async () => {
      try {
        // (1) 버전 확인
        const vRes = await fetch('https://ddragon.leagueoflegends.com/api/versions.json');
        const vJson = await vRes.json();
        const ver = vJson[0];
        setVersion(ver);

        // (2) 챔피언, 아이템, 스펠, 룬 동시 호출 (Promise.all)
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

        // --- 챔피언 정렬 ---
        setChampions(Object.values(cJson.data).sort((a, b) => a.name.localeCompare(b.name, 'ko')));
        
        // --- 아이템 필터링 (중복 제거 핵심 로직) ---
        const rawItems = Object.values(iJson.data);
        const uniqueItems = [];
        const itemNames = new Set(); // 이름 중복 확인용

        rawItems.forEach((item) => {
          // 1. 구매 가능 여부
          // 2. 소환사의 협곡(Map 11)에서 사용 가능 여부
          // 3. 조합법의 결과물이 없는 중간 단계 아이템(into) 제외 (선택사항, 여기선 일단 포함)
          // 4. 이름이 이미 등록되지 않은 경우 (중복 제거)
          // 5. requiredAlly(오른 전용 등) 제외
          if (
            item.gold.purchasable &&     // 구매 가능하고
            item.maps['11'] === true &&  // 소환사의 협곡 맵이고
            !itemNames.has(item.name) && // 아직 리스트에 없는 이름이고
            !item.requiredAlly           // 특정 아군(오른) 필요 아이템 제외
          ) {
            itemNames.add(item.name);    // 이름 등록
            uniqueItems.push(item);      // 리스트 추가
          }
        });
        
        // 이름 가나다순 정렬
        uniqueItems.sort((a, b) => a.name.localeCompare(b.name, 'ko'));
        setItems(uniqueItems);

        // --- 스펠 필터링 ---
        const validSpells = Object.values(sJson.data).filter(spell => {
          // "CLASSIC" 모드(소환사의 협곡)가 포함된 스펠만 허용
          return spell.modes.includes("CLASSIC");
        });
        setSpells(validSpells);

        // --- 룬 설정 ---
        setRunes(rJson);

      } catch (err) {
        console.error("데이터 로딩 실패:", err);
      }
    };
    fetchData();
  }, []);

  // --- 4. 챔피언 선택 시 스킨 정보 가져오기 ---
  useEffect(() => {
    if (formData.championId && version) {
      const fetchSkin = async () => {
        const res = await fetch(`https://ddragon.leagueoflegends.com/cdn/${version}/data/ko_KR/champion/${formData.championId}.json`);
        const json = await res.json();
        setSelectedChampDetail(json.data[formData.championId]);
      };
      fetchSkin();
    }
  }, [formData.championId, version]);


  // --- 5. 핸들러 함수들 ---
  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleItemAdd = (itemId) => {
    if (formData.itemBuild.length >= 6) return alert("아이템은 최대 6개입니다.");
    setFormData({ ...formData, itemBuild: [...formData.itemBuild, itemId] });
  };

  const handleRuneStyleChange = (e) => {
    setFormData({
      ...formData,
      runeStyle: e.target.value,
      runeCore: ''
    });
  };

  const handleSave = () => {
    if (!formData.championId) return alert("챔피언을 선택해주세요.");
    
    const savedList = JSON.parse(localStorage.getItem('myBuilds')) || [];
    const newBuild = { ...formData, id: Date.now(), version };
    localStorage.setItem('myBuilds', JSON.stringify([...savedList, newBuild]));
    
    alert("챔피언 빌드가 저장되었습니다!");
    
    // 3. 저장 완료 후 '/myinfo' 페이지로 강제 이동
    navigate('/myinfo');
  }
  const selectedRuneStyle = runes.find(r => r.id === formData.runeStyle);
  const keystoneList = selectedRuneStyle ? selectedRuneStyle.slots[0].runes : [];

  return (
    <div className="container py-4">
      <h2 className="fw-bold mb-4">📝 챔피언 빌드 만들기</h2>
      
      <div className="row g-3">
        {/* 챔피언 & 포지션 */}
        <div className="col-md-6">
          <label className="form-label">챔피언 선택</label>
          <select className="form-select" name="championId" value={formData.championId} onChange={handleChange}>
            <option value="">챔피언을 선택하세요</option>
            {champions.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
          </select>
        </div>
        <div className="col-md-6">
          <label className="form-label">포지션</label>
          <select className="form-select" name="position" value={formData.position} onChange={handleChange}>
            <option value="TOP">탑 (Top)</option>
            <option value="JUNGLE">정글 (Jungle)</option>
            <option value="MIDDLE">미드 (Middle)</option>
            <option value="BOTTOM">원딜 (Bottom)</option>
            <option value="UTILITY">서폿 (Support)</option>
          </select>
        </div>

        {/* 스킨 (챔피언 선택 후 활성화) */}
        <div className="col-md-12">
          <label className="form-label">선호 스킨</label>
          <select className="form-select" name="skinId" value={formData.skinId} onChange={handleChange} disabled={!selectedChampDetail}>
            <option value="">기본 스킨</option>
            {selectedChampDetail?.skins.map(skin => (
              <option key={skin.id} value={skin.num}>{skin.name}</option>
            ))}
          </select>
        </div>

        {/* 스펠 */}
        <div className="col-md-6">
          <label className="form-label">스펠 D</label>
          <select className="form-select" name="spell1" value={formData.spell1} onChange={handleChange}>
             <option value="">선택</option>
             {spells.map(s => (
               <option key={s.id} value={s.id}
                 disabled={s.id === formData.spell2} // 스펠 F(spell2)에서 이미 선택된 값이면 비활성화
               >{s.name}</option>
             ))}
          </select>
        </div>

        <div className="col-md-6">
          <label className="form-label">스펠 F</label>
          <select className="form-select" name="spell2" value={formData.spell2} onChange={handleChange}>
             <option value="">선택</option>
             {spells.map(s => (<option key={s.id} value={s.id}
                 disabled={s.id === formData.spell1} // 스펠 D(spell1)에서 이미 선택된 값이면 비활성화
               >{s.name}</option>
             ))}
          </select>
        </div>

        {/* 스킬 마스터리 순서 */}
        <div className="col-md-6">
          <label className="form-label">스킬 선마 순서</label>
          <select className="form-select" name="skillOrder" value={formData.skillOrder} onChange={handleChange}>
            <option value="Q>W>E">{'Q>W>E'}</option>
            <option value="Q>E>W">{'Q>E>W'}</option>
            <option value="W>Q>E">{'W>Q>E'}</option>
            <option value="W>E>Q">{'W>E>Q'}</option>
            <option value="E>Q>W">{'E>Q>W'}</option>
            <option value="E>W>Q">{'E>W>Q'}</option>
          </select>
        </div>

        {/* 룬 설정  */}
        <div className="col-md-6">
          <label className="form-label">룬 설정 (빌드 & 핵심)</label>
          <div className="input-group"> 
            {/* 1단계: 룬 빌드 선택 */}
            <select 
              className="form-select" 
              name="runeStyle" 
              value={formData.runeStyle} 
              onChange={handleRuneStyleChange}
            >
              <option value="">빌드 선택</option>
              {runes.map(r => (<option key={r.id} value={r.id}>{r.name}</option>))}
            </select>
            {/* 2단계: 핵심 룬 선택 */}
            <select 
              className="form-select" 
              name="runeCore" 
              value={formData.runeCore} 
              onChange={handleChange}
              disabled={!formData.runeStyle}
            >
              <option value="">핵심 룬 선택</option>
              {keystoneList.map(k => (<option key={k.id} value={k.id}>{k.name}</option>))}
            </select>
          </div>
        </div>

        {/* 아이템 빌드 (검색 및 추가) */}
        <div className="col-12">
          <label className="form-label">아이템 빌드 (클릭하여 추가, 최대 6개)</label>
          <div className="d-flex mb-2">
             {formData.itemBuild.map((id, idx) => (
               <img key={idx} src={`https://ddragon.leagueoflegends.com/cdn/${version}/img/item/${id}.png`} 
                    className="rounded border border-secondary me-1" style={{width: 50, height: 50}} alt="item" />
             ))}
          </div>
          <input 
            type="text" 
            className="form-control mb-2" 
            placeholder="아이템 이름 검색..." 
            onChange={(e) => setItemSearch(e.target.value)} 
          />
          <div className="d-flex flex-wrap gap-1 border p-2" style={{maxHeight: '150px', overflowY: 'auto'}}>
            {items
              .filter(i => i.name.includes(itemSearch) && itemSearch.length > 0)
              .map(item => (
                <img 
                  key={item.image.full} 
                  src={`https://ddragon.leagueoflegends.com/cdn/${version}/img/item/${item.image.full}`}
                  style={{width: 40, cursor: 'pointer'}} 
                  title={item.name}
                  onClick={() => handleItemAdd(item.image.full.replace('.png', ''))}
                  alt={item.name}
                />
            ))}
          </div>
        </div>

        <div className="col-12 mt-4">
          <button className="btn btn-success w-100 btn-lg" onClick={handleSave}>공략 저장하기</button>
        </div>
      </div>
    </div>
  );
};

export default Create;