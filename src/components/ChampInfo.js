// src/components/ChampionModal.js
import React, { useEffect, useState } from 'react';

const ChampionModal = ({ show, onClose, championId, version }) => {
  const [champData, setChampData] = useState(null);
  const [loading, setLoading] = useState(false);

  // championId가 변경되거나 모달이 열릴 때 데이터 가져오기
  useEffect(() => {
    if (show && championId && version) {
      fetchDetailData();
    }
  }, [show, championId, version]);

  const fetchDetailData = async () => {
    setLoading(true);
    try {
      const url = `https://ddragon.leagueoflegends.com/cdn/${version}/data/ko_KR/champion/${championId}.json`;
      const res = await fetch(url);
      const json = await res.json();
      setChampData(json.data[championId]);
    } catch (err) {
      console.error(err);
      alert('챔피언 정보를 가져오지 못했습니다.');
    } finally {
      setLoading(false);
    }
  };

  // 텍스트 내의 HTML 태그 제거 함수 (정규식)
  const stripHtml = (html) => {
    const tmp = document.createElement('DIV');
    tmp.innerHTML = html;
    return tmp.textContent || tmp.innerText || '';
  };

  if (!show) return null;

  return (
    // Bootstrap Modal을 수동으로 제어하기 위한 스타일
    <div className="modal fade show" style={{ display: 'block', backgroundColor: 'rgba(0,0,0,0.5)' }} tabIndex="-1">
      <div className="modal-dialog modal-lg modal-dialog-centered modal-dialog-scrollable">
        <div className="modal-content">
          
          <div className="modal-header">
            <h5 className="modal-title fw-bold">
              {champData ? champData.name : 'Loading...'}
            </h5>
            <button type="button" class="btn-close" onClick={onClose}></button>
          </div>

          <div className="modal-body">
            {loading || !champData ? (
              <div className="text-center py-5">
                <div className="spinner-border text-primary" role="status">
                  <span className="visually-hidden">Loading...</span>
                </div>
              </div>
            ) : (
              <>
                {/* 상단: 이미지와 설명 */}
                <div className="row mb-4">
                  <div className="col-md-5">
                    <img
                      src={`https://ddragon.leagueoflegends.com/cdn/img/champion/loading/${championId}_0.jpg`}
                      className="img-fluid rounded shadow"
                      alt={champData.name}
                    />
                  </div>
                  <div className="col-md-7">
                    <h3 className="fw-bold">{champData.name}</h3>
                    <p className="fst-italic text-muted fs-5">{champData.title}</p>
                    <hr />
                    <p className="small">{champData.lore}</p>
                  </div>
                </div>

                {/* 하단: 스킬 리스트 */}
                <h5 className="fw-bold mb-3">스킬 정보</h5>
                <div className="list-group list-group-flush">
                  {/* 패시브 (수정됨) */}
                  <div className="list-group-item d-flex align-items-start bg-light py-3">
                    <div className="flex-shrink-0"> {/* 이미지 영역 고정 */}
                      <img 
                        src={`https://ddragon.leagueoflegends.com/cdn/${version}/img/passive/${champData.passive.image.full}`}
                        style={{ width: 48, height: 48, borderRadius: '50%', border: '2px solid #d4af37' }}
                        alt="Passive"
                      />
                    </div>
                    <div className="flex-grow-1 ms-3"> {/* 텍스트 영역 */}
                      <div className="mb-1">
                        <span className="fw-bold text-primary">패시브 - {champData.passive.name}</span>
                      </div>
                      <p className="text-muted small mb-0" style={{ lineHeight: '1.4' }}>
                        {stripHtml(champData.passive.description)}
                      </p>
                    </div>
                  </div>

                  {/* 스킬 QWER (수정됨) */}
                  {champData.spells.map((spell, idx) => {
                    const keyMap = ['Q', 'W', 'E', 'R'];
                    return (
                      // align-items-start로 변경하여 무조건 위쪽 정렬
                      <div className="list-group-item d-flex align-items-start py-3" key={spell.id}>
                        <div className="flex-shrink-0">
                          <img 
                            src={`https://ddragon.leagueoflegends.com/cdn/${version}/img/spell/${spell.image.full}`}
                            style={{ width: 48, height: 48, borderRadius: 4, border: '1px solid #333' }}
                            alt={spell.name}
                          />
                        </div>
                          
                        {/* ms-3으로 이미지와 간격 확보 */}
                        <div className="flex-grow-1 ms-3">
                          <div className="mb-1">
                            <span className="fw-bold fs-6">[{keyMap[idx]}] {spell.name}</span>
                            <span className="text-muted ms-2 small">
                              (쿨타임: {spell.cooldownBurn}초)
                            </span>
                          </div>
                            
                          {/* 설명 텍스트 스타일 정리 */}
                          <p className="text-muted small mb-0 text-break" style={{ lineHeight: '1.4' }}>
                            {stripHtml(spell.description)}
                          </p>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </>
            )}
          </div>
          
          <div className="modal-footer">
            <button type="button" className="btn btn-secondary" onClick={onClose}>닫기</button>
          </div>

        </div>
      </div>
    </div>
  );
};

export default ChampionModal;