import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
// import './Create.css'; // Create.js와 동일한 스타일(어두운 배경) 사용

const Update = () => {
  const navigate = useNavigate();
  const location = useLocation();

  // 1. 수정할 데이터 받기 (MyInfo에서 넘겨준 값)
  const targetBuild = location.state?.build || null;

  const [version, setVersion] = useState('');
  const [champions, setChampions] = useState([]);
  const [items, setItems] = useState([]);
  const [spells, setSpells] = useState([]); 
  const [runes, setRunes] = useState([]);
  const [loading, setLoading] = useState(true); // 로딩 상태 관리

  // 챔피언 상세 정보 (스킨 로딩용)
  const [selectedChampDetail, setSelectedChampDetail] = useState(null);

  // 2. Form State 초기화 (targetBuild가 있으면 그 값으로, 없으면 빈 값)
  const [formData, setFormData] = useState({
    championId: targetBuild?.championId || '',
    position: targetBuild?.position || 'TOP',
    skinId: targetBuild?.skinId || '',
    spell1: targetBuild?.spell1 || '',
    spell2: targetBuild?.spell2 || '',
    skillOrder: targetBuild?.skillOrder || 'Q>W>E',
    runeStyle: targetBuild?.runeStyle || '',
    runeCore: targetBuild?.runeCore || '',
    itemBuild: targetBuild?.itemBuild || [] 
  });

  const [itemSearch, setItemSearch] = useState('');

  // 3. 잘못된 접근 차단 (URL 직접 접근 시)
  useEffect(() => {
    if (!targetBuild) {
      alert("잘못된 접근입니다. 내 보관함에서 수정 버튼을 눌러주세요.");
      navigate('/myinfo');
    }
  }, [targetBuild, navigate]);

  // 4. 초기 데이터 로딩 (Create.js의 로직과 동일하게 맞춤)
  useEffect(() => {
    if (!targetBuild) return;

    const fetchData = async () => {
      try {
        setLoading(true);
        // (1) 버전 확인
        const vRes = await fetch('https://ddragon.leagueoflegends.com/api/versions.json');
        const vJson = await vRes.json();
        const ver = vJson[0];
        setVersion(ver);

        // (2) 데이터 동시 호출
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
        
        // 아이템 필터링 (Create.js와 동일한 로직 적용)
        const rawItems = Object.values(iJson.data);
        const uniqueItems = [];
        const itemNames = new Set();
        rawItems.forEach((item) => {
          if (item.gold.purchasable && item.maps['11'] && !itemNames.has(item.name) && !item.requiredAlly) {
            itemNames.add(item.name);
            uniqueItems.push(item);
          }
        });
        uniqueItems.sort((a, b) => a.name.localeCompare(b.name, 'ko'));
        setItems(uniqueItems);

        // 스펠 필터링
        const validSpells = Object.values(sJson.data).filter(spell => spell.modes.includes("CLASSIC"));
        setSpells(validSpells);

        // 룬 설정
        setRunes(rJson);

      } catch (err) {
        console.error("데이터 로딩 실패:", err);
        alert("데이터를 불러오는 중 오류가 발생했습니다.");
      } finally {
        setLoading(false); // 로딩 끝
      }
    };

    fetchData();
  }, [targetBuild]);

  // 5. 챔피언 선택 시 스킨 정보 가져오기 (초기 로딩 시에도 실행됨)
  useEffect(() => {
    if (formData.championId && version) {
      fetch(`https://ddragon.leagueoflegends.com/cdn/${version}/data/ko_KR/champion/${formData.championId}.json`)
        .then(res => res.json())
        .then(json => setSelectedChampDetail(json.data[formData.championId]))
        .catch(console.error);
    }
  }, [formData.championId, version]);

  // --- 핸들러 ---
  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleItemAdd = (itemId) => {
    if (formData.itemBuild.length >= 6) return alert("아이템은 최대 6개입니다.");
    setFormData({ ...formData, itemBuild: [...formData.itemBuild, itemId] });
  };

  // Create에는 없지만 Update에는 필요한 기능: 아이템 삭제
  const handleItemRemove = (indexToRemove) => {
    setFormData({
        ...formData,
        itemBuild: formData.itemBuild.filter((_, idx) => idx !== indexToRemove)
    });
  };

  const handleRuneStyleChange = (e) => {
    setFormData({
      ...formData,
      runeStyle: e.target.value,
      runeCore: '' // 스타일 변경 시 하위 룬 초기화
    });
  };

  const handleUpdate = () => {
    if (!formData.championId) return alert("챔피언 정보가 없습니다.");
    
    const savedList = JSON.parse(localStorage.getItem('myBuilds')) || [];
    // ID가 같은 항목을 찾아 교체 (수정)
    const updatedList = savedList.map(item => 
        item.id === targetBuild.id ? { ...formData, id: item.id, version } : item
    );

    localStorage.setItem('myBuilds', JSON.stringify(updatedList));
    alert("수정이 완료되었습니다!");
    navigate('/myinfo');
  };

  // --- 렌더링 ---
  
  if (!targetBuild) return null; // 잘못된 접근 방지

  if (loading) {
    // 배경색 때문에 글씨가 안 보일 수 있으므로 text-white 추가
    return (
        <div className="container py-5 text-center text-white">
            <h3>데이터를 불러오는 중입니다...</h3>
            <div className="spinner-border text-primary mt-3" role="status">
                <span className="visually-hidden">Loading...</span>
            </div>
        </div>
    );
  }

  // 룬 선택 로직 (타입 변환 처리 포함)
  const selectedRuneStyle = runes.find(r => r.id == formData.runeStyle);
  const keystoneList = selectedRuneStyle ? selectedRuneStyle.slots[0].runes : [];

  return (
    <div className="create-container container py-4"> 
      {/* 제목 색상 지정 (Create.js와 다르게 여기선 배경이 어두울 수 있으므로 색상 명시) */}
      <h2 className="fw-bold mb-4" style={{color: '#C89B3C'}}>🛠️ 챔피언 빌드 수정하기</h2>
      
      <div className="row g-3">
        {/* 모든 label에 text-white 클래스를 추가하여 어두운 배경에서 보이게 함 */}
        
        {/* 챔피언 & 포지션 */}
        <div className="col-md-6">
          <label className="form-label text-white">챔피언 선택</label>
          <select className="form-select" name="championId" value={formData.championId} onChange={handleChange}>
            <option value="">챔피언을 선택하세요</option>
            {champions.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
          </select>
        </div>
        <div className="col-md-6">
          <label className="form-label text-white">포지션</label>
          <select className="form-select" name="position" value={formData.position} onChange={handleChange}>
            <option value="TOP">탑 (Top)</option>
            <option value="JUNGLE">정글 (Jungle)</option>
            <option value="MIDDLE">미드 (Middle)</option>
            <option value="BOTTOM">원딜 (Bottom)</option>
            <option value="UTILITY">서폿 (Support)</option>
          </select>
        </div>

        {/* 스킨 */}
        <div className="col-md-12">
          <label className="form-label text-white">선호 스킨</label>
          <select className="form-select" name="skinId" value={formData.skinId} onChange={handleChange} disabled={!selectedChampDetail}>
            <option value="">기본 스킨</option>
            {selectedChampDetail?.skins?.map(skin => (
              <option key={skin.id} value={skin.num}>{skin.name}</option>
            ))}
          </select>
        </div>

        {/* 스펠 */}
        <div className="col-md-6">
          <label className="form-label text-white">스펠 D</label>
          <select className="form-select" name="spell1" value={formData.spell1} onChange={handleChange}>
             <option value="">선택</option>
             {spells.map(s => (
               <option key={s.id} value={s.id} disabled={s.id === formData.spell2}>{s.name}</option>
             ))}
          </select>
        </div>

        <div className="col-md-6">
          <label className="form-label text-white">스펠 F</label>
          <select className="form-select" name="spell2" value={formData.spell2} onChange={handleChange}>
             <option value="">선택</option>
             {spells.map(s => (
                <option key={s.id} value={s.id} disabled={s.id === formData.spell1}>{s.name}</option>
             ))}
          </select>
        </div>

        {/* 스킬 마스터리 */}
        <div className="col-md-6">
          <label className="form-label text-white">스킬 선마 순서</label>
          <select className="form-select" name="skillOrder" value={formData.skillOrder} onChange={handleChange}>
            <option value="Q>W>E">{'Q>W>E'}</option>
            <option value="Q>E>W">{'Q>E>W'}</option>
            <option value="W>Q>E">{'W>Q>E'}</option>
            <option value="W>E>Q">{'W>E>Q'}</option>
            <option value="E>Q>W">{'E>Q>W'}</option>
            <option value="E>W>Q">{'E>W>Q'}</option>
          </select>
        </div>

        {/* 룬 설정 */}
        <div className="col-md-6">
          <label className="form-label text-white">룬 설정 (빌드 & 핵심)</label>
          <div className="input-group"> 
            <select className="form-select" name="runeStyle" value={formData.runeStyle} onChange={handleRuneStyleChange}>
              <option value="">빌드 선택</option>
              {runes.map(r => (<option key={r.id} value={r.id}>{r.name}</option>))}
            </select>
            <select className="form-select" name="runeCore" value={formData.runeCore} onChange={handleChange} disabled={!formData.runeStyle}>
              <option value="">핵심 룬 선택</option>
              {keystoneList.map(k => (<option key={k.id} value={k.id}>{k.name}</option>))}
            </select>
          </div>
        </div>

        {/* 아이템 빌드 */}
        <div className="col-12">
          <label className="form-label text-white">아이템 빌드 (클릭하여 삭제 가능)</label>
          
          {/* 선택된 아이템 목록 (삭제 기능 포함) */}
          <div className="d-flex mb-2 p-2 gap-2" style={{minHeight: '60px', backgroundColor: 'rgba(255,255,255,0.1)', borderRadius: '4px'}}>
             {formData.itemBuild.length === 0 && <span className="text-white-50 small align-self-center">선택된 아이템이 없습니다.</span>}
             {formData.itemBuild.map((id, idx) => (
               <div key={idx} className="position-relative" onClick={() => handleItemRemove(idx)} style={{cursor: 'pointer'}}>
                   <img src={`https://ddragon.leagueoflegends.com/cdn/${version}/img/item/${id}.png`} 
                        className="rounded border border-warning" style={{width: 50, height: 50}} alt="item" 
                   />
                   <span className="position-absolute top-0 start-100 translate-middle badge rounded-pill bg-danger" style={{fontSize:'0.6rem'}}>X</span>
               </div>
             ))}
          </div>
          
          {/* 아이템 검색 */}
          <input 
            type="text" 
            className="form-control mb-2" 
            placeholder="아이템 이름 검색..." 
            value={itemSearch}
            onChange={(e) => setItemSearch(e.target.value)} 
          />
          {/* 아이템 리스트 (Create.js 스타일 참고) */}
          <div className="d-flex flex-wrap gap-1 border p-2" style={{maxHeight: '150px', overflowY: 'auto', backgroundColor: '#1e2328'}}>
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

        <div className="col-12 mt-4 d-flex gap-2">
          <button className="btn btn-secondary flex-grow-1" onClick={() => navigate(-1)}>취소</button>
          <button className="btn btn-primary flex-grow-1 fw-bold" onClick={handleUpdate}>수정 완료</button>
        </div>
      </div>
    </div>
  );
};

export default Update;