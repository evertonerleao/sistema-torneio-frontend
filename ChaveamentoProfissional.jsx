
import { Badge, Button } from '@/components/ui'
import { useState, useEffect } from 'react'

export default function ChaveamentoProfissional({ initialChaveamento, onDefinirVencedor }) {
  const [chaveamento, setChaveamento] = useState(initialChaveamento)

  const handleVencedor = (rodadaKey, partidaId, vencedor) => {
    const novaChave = { ...chaveamento }
    novaChave[rodadaKey] = novaChave[rodadaKey].map(p =>
      p.id === partidaId ? { ...p, vencedor } : p
    )

    // Avança vencedor para a próxima rodada
    const rodadas = Object.keys(novaChave)
    const indexRodada = rodadas.indexOf(rodadaKey)
    const proximaRodada = rodadas[indexRodada + 1]
    if (proximaRodada) {
      const partidaIndex = Math.floor(partidaId / 2) // calcula a posição na próxima rodada
      const partidaProx = novaChave[proximaRodada][partidaIndex]
      if (!partidaProx.equipe1) partidaProx.equipe1 = vencedor
      else partidaProx.equipe2 = vencedor
    }

    setChaveamento(novaChave)
    onDefinirVencedor(partidaId, vencedor.id)
  }

  return (
    <div className="overflow-x-auto p-4">
      <div className="flex gap-12 items-start relative">
        {Object.entries(chaveamento).map(([rodada, partidas], rodadaIndex) => (
          <div key={rodada} className="flex flex-col gap-12 min-w-[240px]">
            <h2 className="text-center font-bold mb-4 capitalize">{rodada.replace('_', ' ')}</h2>
            {partidas.map((partida, idx) => (
              <div key={partida.id} className="relative flex flex-col gap-2">
                {/* Linha SVG conectando para a próxima rodada */}
                {partida.vencedor && rodadaIndex < Object.keys(chaveamento).length - 1 && (
                  <svg className="absolute top-1/2 left-full w-6 h-6">
                    <line x1="0" y1="12" x2="24" y2="12" stroke="gray" strokeWidth="2" />
                  </svg>
                )}

                <div className={`border rounded-lg p-4 shadow-sm bg-white transition-all duration-500 ${partida.vencedor ? 'bg-green-50' : ''}`}>
                  <div className="flex justify-between items-center">
                    <span className={partida.vencedor?.id === partida.equipe1?.id ? 'text-green-600 font-bold' : ''}>
                      {partida.equipe1 ? partida.equipe1.nome : 'TBD'}
                    </span>
                    {!partida.vencedor && partida.equipe1 && partida.equipe2 && (
                      <Button size="sm" onClick={() => handleVencedor(rodada, partida.id, partida.equipe1)}>
                        Venceu
                      </Button>
                    )}
                  </div>

                  <div className="text-center text-gray-500 text-sm">vs</div>

                  <div className="flex justify-between items-center">
                    <span className={partida.vencedor?.id === partida.equipe2?.id ? 'text-green-600 font-bold' : ''}>
                      {partida.equipe2 ? partida.equipe2.nome : 'BYE'}
                    </span>
                    {!partida.vencedor && partida.equipe1 && partida.equipe2 && (
                      <Button size="sm" onClick={() => handleVencedor(rodada, partida.id, partida.equipe2)}>
                        Venceu
                      </Button>
                    )}
                  </div>

                  {partida.vencedor && (
                    <Badge className="bg-green-100 text-green-800 text-center mt-2">
                      Vencedor: {partida.vencedor.nome}
                    </Badge>
                  )}
                </div>
              </div>
            ))}
          </div>
        ))}
      </div>
    </div>
  )
}
