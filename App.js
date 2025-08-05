import React, { useState } from "react";
import axios from "axios";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  ResponsiveContainer
} from "recharts";

const calcularEstatisticas = (valores) => {
  const media = valores.reduce((a, b) => a + b, 0) / valores.length;
  const over15 = valores.filter((v) => v > 1.5).length / valores.length;
  const prob = Number(over15.toFixed(2));
  const fair = prob > 0 ? Number((1 / prob).toFixed(2)) : "Inviável";
  const ev = prob > 0 ? Number((prob * 2.0 - 1).toFixed(2)) : "Inviável";
  return { media, prob, fair, ev };
};

export default function PropsCashWebApp() {
  const [player, setPlayer] = useState("Hulk");
  const [teamId] = useState("134");
  const [season] = useState("2025");
  const [league] = useState("71");
  const [stats, setStats] = useState({});
  const [loading, setLoading] = useState(false);

  const getPlayerStats = async () => {
    setLoading(true);
    setStats({});
    try {
      const res = await axios.get("https://v3.football.api-sports.io/players", {
        headers: {
          "x-apisports-key": "1b76187fac66a1a3085dc0c6ba27a4de",
          "x-rapidapi-host": "v3.football.api-sports.io"
        },
        params: {
          team: teamId,
          season,
          league
        }
      });

      const jogador = res.data.response.find((p) =>
        p.player.name.toLowerCase().includes(player.toLowerCase())
      );

      if (!jogador) {
        alert("Jogador não encontrado");
        setLoading(false);
        return;
      }

      const playerId = jogador.player.id;

      const statsRes = await axios.get("https://v3.football.api-sports.io/players", {
        headers: {
          "x-apisports-key": "1b76187fac66a1a3085dc0c6ba27a4de",
          "x-rapidapi-host": "v3.football.api-sports.io"
        },
        params: {
          id: playerId,
          season,
          league
        }
      });

      const partidas = statsRes.data.response[0].statistics.slice(0, 5);
      const dados = {
        "Finalizações": [],
        "Finalizações no Gol": [],
        "Gols": [],
        "Passes": [],
        "Cartões": [],
        "Desarmes": [],
        "Faltas Cometidas": [],
        "Faltas Sofridas": [],
        "Minutos Jogados": []
      };

      for (const j of partidas) {
        const fixtureId = j.fixture.id;
        const fixtureRes = await axios.get("https://v3.football.api-sports.io/fixtures/players", {
          headers: {
            "x-apisports-key": "1b76187fac66a1a3085dc0c6ba27a4de",
            "x-rapidapi-host": "v3.football.api-sports.io"
          },
          params: {
            fixture: fixtureId,
            team: teamId
          }
        });

        const jogadorStats = fixtureRes.data.response
          .flatMap((t) => t.players)
          .find((p) => p.player.id === playerId);

        dados["Finalizações"].push(j.shots?.total || 0);
        dados["Finalizações no Gol"].push(j.shots?.on || 0);
        dados["Gols"].push(j.goals?.total || 0);
        dados["Passes"].push(j.passes?.total || 0);
        dados["Cartões"].push(j.cards?.yellow || 0);
        dados["Desarmes"].push(jogadorStats.statistics.tackles?.total || 0);
        dados["Faltas Cometidas"].push(jogadorStats.statistics.fouls?.committed || 0);
        dados["Faltas Sofridas"].push(jogadorStats.statistics.fouls?.drawn || 0);
        dados["Minutos Jogados"].push(jogadorStats.statistics.games?.minutes || 0);
      }

      setStats(dados);
    } catch (err) {
      alert("Erro ao buscar dados reais do jogador");
    }
    setLoading(false);
  };

  return (
    <div style={{ padding: "2rem", maxWidth: "1200px", margin: "auto" }}>
      <h1 style={{ fontSize: "24px", fontWeight: "bold", marginBottom: "1rem" }}>PropsCash Web App</h1>
      <div style={{ display: "flex", gap: "1rem", marginBottom: "1rem" }}>
        <input value={player} onChange={(e) => setPlayer(e.target.value)} placeholder="Jogador" />
        <button onClick={getPlayerStats}>{loading ? "Buscando..." : "Buscar"}</button>
      </div>

      {Object.entries(stats).map(([estat, valores]) => {
        const { media, prob, fair, ev } = calcularEstatisticas(valores);
        const chartData = valores.map((v, i) => ({ jogo: `J${i + 1}`, valor: v }));
        return (
          <div key={estat} style={{ marginBottom: "2rem" }}>
            <h3>{estat}</h3>
            <p>Média: {media.toFixed(2)} | Prob. Over 1.5: {(prob * 100).toFixed(0)}% | Fair Odd: {fair} | EV (odd 2.00): {ev}</p>
            <ResponsiveContainer width="100%" height={200}>
              <LineChart data={chartData}>
                <XAxis dataKey="jogo" />
                <YAxis />
                <CartesianGrid strokeDasharray="3 3" />
                <Tooltip />
                <Line type="monotone" dataKey="valor" stroke="#1d4ed8" strokeWidth={2} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        );
      })}
    </div>
  );
}