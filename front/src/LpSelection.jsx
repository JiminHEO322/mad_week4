import './LpSelection.css';

function LpSelection({ onLpSelect }) {
  const lpList = [
    { id: 1, title: 'LP 1', musicPath: './musics/lp1.mp3' },
    { id: 2, title: 'LP 2', musicPath: './musics/lp2.mp3' },
    { id: 3, title: 'LP 3', musicPath: './musics/lp3.mp3' },
  ]; // LP 목록

  return (
    <div className="lp-selection">
      <h1>Select an LP</h1>
      <div className="lp-list">
        {lpList.map((lp) => (
          <div
            key={lp.id}
            className="lp-item"
            onClick={() => onLpSelect(lp.musicPath)} // LP 선택 시 App에 전달
          >
            {lp.title}
          </div>
        ))}
      </div>
    </div>
  );
}

export default LpSelection;
