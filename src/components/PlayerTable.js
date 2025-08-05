
import React, { useState } from 'react';
import players from '../data/players.json';

const PlayerTable = () => {
  const [search, setSearch] = useState('');

  const filteredPlayers = players.filter(p =>
    p.name.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div>
      <input
        type="text"
        placeholder="Buscar jogador..."
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        style={{ marginBottom: '20px', padding: '8px', fontSize: '16px' }}
      />

      {filteredPlayers.map((player, idx) => (
        <div key={idx} style={{ border: '1px solid #ccc', marginBottom: '20px', padding: '10px' }}>
          <h3>{player.name} – {player.team}</h3>
          <div style={{ display: 'flex', justifyContent: 'space-between' }}>
            <div>
              <h4>🏠 Casa (últimos 5 jogos)</h4>
              <p>Finalizações: {player.home.shots.join(', ')}</p>
              <p>Chutes no Gol: {player.home.shots_on_target.join(', ')}</p>
              <p>Desarmes: {player.home.tackles.join(', ')}</p>
              <p>Faltas Cometidas: {player.home.fouls.join(', ')}</p>
            </div>
            <div>
              <h4>🚗 Fora (últimos 5 jogos)</h4>
              <p>Finalizações: {player.away.shots.join(', ')}</p>
              <p>Chutes no Gol: {player.away.shots_on_target.join(', ')}</p>
              <p>Desarmes: {player.away.tackles.join(', ')}</p>
              <p>Faltas Cometidas: {player.away.fouls.join(', ')}</p>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};

export default PlayerTable;
