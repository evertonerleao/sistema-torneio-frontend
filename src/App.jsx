import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button.jsx'
import { Input } from '@/components/ui/input.jsx'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card.jsx'
import { Badge } from '@/components/ui/badge.jsx'
import { Trash2, Shuffle, Trophy, Plus } from 'lucide-react'
import './App.css'

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL

function App() {
  const [equipes, setEquipes] = useState([])
  const [nomeEquipe, setNomeEquipe] = useState('')
  const [chaveamento, setChaveamento] = useState({})
  const [loading, setLoading] = useState(false)
  const [erro, setErro] = useState('')

  // Carregar equipes ao iniciar
  useEffect(() => {
    carregarEquipes()
  }, [])

  const carregarEquipes = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/equipes`)
      const data = await response.json()
      setEquipes(data)
    } catch (error) {
      setErro('Erro ao carregar equipes')
    }
  }

  const adicionarEquipe = async () => {
    if (!nomeEquipe.trim()) {
      setErro('Nome da equipe não pode estar vazio')
      return
    }

    try {
      const response = await fetch(`${API_BASE_URL}/equipes`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ nome: nomeEquipe.trim() }),
      })

      if (response.ok) {
        const novaEquipe = await response.json()
        setEquipes([...equipes, novaEquipe])
        setNomeEquipe('')
        setErro('')
      } else {
        const errorData = await response.json()
        setErro(errorData.erro || 'Erro ao adicionar equipe')
      }
    } catch (error) {
      setErro('Erro ao adicionar equipe')
    }
  }

  const removerEquipe = async (equipeId) => {
    try {
      const response = await fetch(`${API_BASE_URL}/equipes/${equipeId}`, {
        method: 'DELETE',
      })

      if (response.ok) {
        setEquipes(equipes.filter(equipe => equipe.id !== equipeId))
        setErro('')
      }
    } catch (error) {
      setErro('Erro ao remover equipe')
    }
  }

  const limparEquipes = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/equipes/limpar`, {
        method: 'DELETE',
      })

      if (response.ok) {
        setEquipes([])
        setChaveamento({})
        setErro('')
      }
    } catch (error) {
      setErro('Erro ao limpar equipes')
    }
  }

  const realizarSorteio = async () => {
    if (equipes.length < 2) {
      setErro('É necessário pelo menos 2 equipes para realizar o sorteio')
      return
    }

    setLoading(true)
    try {
      const response = await fetch(`${API_BASE_URL}/sorteio`, {
        method: 'POST',
      })

      if (response.ok) {
        const equipesOrdenadas = await response.json()
        setEquipes(equipesOrdenadas)
        setErro('')
      }
    } catch (error) {
      setErro('Erro ao realizar sorteio')
    }
    setLoading(false)
  }

  const gerarChaveamento = async () => {
    if (equipes.length < 2) {
      setErro('É necessário pelo menos 2 equipes para gerar o chaveamento')
      return
    }

    setLoading(true)
    try {
      const response = await fetch(`${API_BASE_URL}/chaveamento`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          equipes_ids: equipes.map(equipe => equipe.id)
        }),
      })

      if (response.ok) {
        const chaveamentoData = await response.json()
        setChaveamento(chaveamentoData)
        setErro('')
      }
    } catch (error) {
      setErro('Erro ao gerar chaveamento')
    }
    setLoading(false)
  }

  const definirVencedor = async (partidaId, vencedorId) => {
    try {
      const response = await fetch(`${API_BASE_URL}/partidas/${partidaId}/vencedor`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ vencedor_id: vencedorId }),
      })

      if (response.ok) {
        // Recarregar o chaveamento
        const chaveamentoResponse = await fetch(`${API_BASE_URL}/partidas`)
        const chaveamentoData = await chaveamentoResponse.json()
        setChaveamento(chaveamentoData)
      }
    } catch (error) {
      setErro('Erro ao definir vencedor')
    }
  }

  const renderPartida = (partida) => {
    const equipe1 = partida.equipe1
    const equipe2 = partida.equipe2
    const vencedor = partida.vencedor

    return (
      <div key={partida.id} className="border rounded-lg p-4 bg-white shadow-sm">
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <span className={`font-medium ${vencedor && vencedor.id === equipe1?.id ? 'text-green-600 font-bold' : ''}`}>
              {equipe1 ? equipe1.nome : 'TBD'}
            </span>
            {equipe1 && equipe2 && !vencedor && (
              <Button
                size="sm"
                variant="outline"
                onClick={() => definirVencedor(partida.id, equipe1.id)}
              >
                Venceu
              </Button>
            )}
          </div>
          
          <div className="text-center text-gray-500 text-sm">vs</div>
          
          <div className="flex items-center justify-between">
            <span className={`font-medium ${vencedor && vencedor.id === equipe2?.id ? 'text-green-600 font-bold' : ''}`}>
              {equipe2 ? equipe2.nome : 'BYE'}
            </span>
            {equipe1 && equipe2 && !vencedor && (
              <Button
                size="sm"
                variant="outline"
                onClick={() => definirVencedor(partida.id, equipe2.id)}
              >
                Venceu
              </Button>
            )}
          </div>
          
          {vencedor && (
            <div className="text-center mt-2">
              <Badge variant="default" className="bg-green-100 text-green-800">
                Vencedor: {vencedor.nome}
              </Badge>
            </div>
          )}
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 p-4">
      <div className="max-w-6xl mx-auto space-y-6">
        <div className="text-center">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Sistema de Torneio
          </h1>
          <p className="text-gray-600">
            Adicione equipes, realize sorteio e gere chaveamento
          </p>
        </div>

        {erro && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
            {erro}
          </div>
        )}

        {/* Seção de Equipes */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Trophy className="h-5 w-5" />
              Equipes ({equipes.length})
            </CardTitle>
            <CardDescription>
              Adicione as equipes que participarão do torneio
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex gap-2">
              <Input
                placeholder="Nome da equipe"
                value={nomeEquipe}
                onChange={(e) => setNomeEquipe(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && adicionarEquipe()}
              />
              <Button onClick={adicionarEquipe}>
                <Plus className="h-4 w-4 mr-2" />
                Adicionar
              </Button>
            </div>

            {equipes.length > 0 && (
              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <h3 className="font-medium">Equipes Cadastradas:</h3>
                  <Button variant="destructive" size="sm" onClick={limparEquipes}>
                    <Trash2 className="h-4 w-4 mr-2" />
                    Limpar Todas
                  </Button>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2">
                  {equipes.map((equipe, index) => (
                    <div key={equipe.id} className="flex items-center justify-between bg-gray-100 p-2 rounded">
                      <span className="font-medium">
                        {index + 1}. {equipe.nome}
                      </span>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => removerEquipe(equipe.id)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  ))}
                </div>
              </div>
            )}

            <div className="flex gap-2">
              <Button
                onClick={realizarSorteio}
                disabled={loading || equipes.length < 2}
                variant="outline"
              >
                <Shuffle className="h-4 w-4 mr-2" />
                Realizar Sorteio
              </Button>
              <Button
                onClick={gerarChaveamento}
                disabled={loading || equipes.length < 2}
              >
                <Trophy className="h-4 w-4 mr-2" />
                Gerar Chaveamento
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Seção do Chaveamento */}
        {Object.keys(chaveamento).length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle>Chaveamento do Torneio</CardTitle>
              <CardDescription>
                Clique em "Venceu" para avançar as equipes no torneio
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                {Object.entries(chaveamento).map(([rodada, partidas]) => (
                  <div key={rodada}>
                    <h3 className="text-lg font-semibold mb-3 capitalize">
                      {rodada.replace('_', ' ')}
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                      {partidas.map(renderPartida)}
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  )
}

export default App
