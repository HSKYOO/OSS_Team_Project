import { Routes, Route, NavLink } from 'react-router-dom'; // 라우터 관련 컴포넌트 불러오기
import ChampDex from './components/ChampDex';
import Create from './components/CRUD/Create';
import MyInfo from './components/CRUD/MyInfo';
import Update from './components/CRUD/Update';
import './App.css';

function App() {

  return (
    <div className="App">
      {/* 네비게이션 바 */}
      <nav className="navbar navbar-expand-lg navbar-dark bg-dark mb-4">
        <div className="container">
          <span className="navbar-brand fw-bold d-flex align-items-center">
            <img 
              src="https://images.teepublic.com/derived/production/designs/50985578_0/1695563418/i_p:c_000000,s_630,q_90.jpg" 
              alt="Logo"
              width="40" 
              height="40" 
              className="d-inline-block align-text-top me-2 rounded-circle" 
            />
            LoL App
          </span>
          
          <div className="d-flex gap-2">
            {/* NavLink는 현재 URL과 일치하면 자동으로 'active' 클래스가 붙습니다. 
                이를 이용해서 버튼 색상을 동적으로 바꿀 수 있습니다. */}
                
            <NavLink 
              to="/" 
              className={({ isActive }) => `btn btn-sm ${isActive ? 'btn-primary' : 'btn-outline-light'}`}
            >
              챔피언 도감
            </NavLink>
            
            <NavLink 
              to="/create" 
              className={({ isActive }) => `btn btn-sm ${isActive ? 'btn-primary' : 'btn-outline-light'}`}
            >
              챔피언 빌드 생성
            </NavLink>
            
            <NavLink 
              to="/myinfo" 
              className={({ isActive }) => `btn btn-sm ${isActive ? 'btn-primary' : 'btn-outline-light'}`}
            >
              내 빌드
            </NavLink>
          </div>
        </div>
      </nav>

      <div className="container">
        {/* URL에 따라 컴포넌트를 갈아끼우는 영역 */}
        <Routes>
          <Route path="/" element={<ChampDex />} />
          <Route path="/create" element={<Create />} />
          <Route path="/myinfo" element={<MyInfo />} />
          <Route path="/update/:id" element={<Update />} />
        </Routes>
      </div>
    </div>
  );
}

export default App;