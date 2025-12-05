import React, { useEffect, useState } from "react";
import {
	Users,
	Calendar,
	DollarSign,
	Activity,
	TrendingUp,
} from "lucide-react";
import {
	AreaChart,
	Area,
	XAxis,
	YAxis,
	CartesianGrid,
	Tooltip,
	ResponsiveContainer,
} from "recharts";

export default function DashboardPage() {
	// Estado que armazena os dados retornados da API /api/dashboard
	const [data, setData] = useState(null);
	// Controle de carregamento da página (spinner enquanto busca os dados)
	const [loading, setLoading] = useState(true);

	// Busca os dados do backend Java ao abrir a tela
	useEffect(() => {
		async function fetchDashboard() {
			try {
				const response = await fetch("/api/dashboard");

				// Se a sessão expirou ou não está autenticado, redireciona para login
				if (response.status === 401) {
					window.location.href = "/login";
					return;
				}

				// Converte o corpo da resposta em JSON e armazena no estado
				const json = await response.json();
				setData(json);
			} catch (error) {
				console.error("Erro ao carregar dashboard", error);
			} finally {
				// Independente de sucesso ou erro, encerra o loading
				setLoading(false);
			}
		}
		fetchDashboard();
	}, []); // [] garante que será executado apenas uma vez ao montar o componente

	// Enquanto estiver carregando, exibe um spinner centralizado
	if (loading)
		return (
			<div className='p-8 flex justify-center'>
				<div className='animate-spin rounded-full h-8 w-8 border-b-2 border-emerald-500'></div>
			</div>
		);

	// Se não conseguiu obter dados (objeto nulo), mostra mensagem simples de erro
	if (!data)
		return <div className='p-8'>Não foi possível carregar os dados.</div>;

	return (
		<main className='flex-1 ml-64 p-8 bg-gray-50 min-h-screen'>
			{/* Cabeçalho do Dashboard */}
			<div className='mb-8'>
				<h2 className='text-3xl font-bold text-gray-900'>Dashboard</h2>
				<p className='text-gray-500 mt-1'>Bem-vindo ao Health Money</p>
			</div>

			{/* --- CARDS DO TOPO (Valores Reais do Banco) --- */}
			{/* Cada card usa o componente auxiliar DashboardCard para ficar mais organizado */}
			<div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8'>
				<DashboardCard
					title='Total de Pacientes'
					value={data.totalPacientes}
					icon={Users}
					color='blue'
				/>

				<DashboardCard
					title='Atendimentos (Mês)'
					value={data.atendimentosMes}
					icon={Calendar}
					color='purple'
				/>

				<DashboardCard
					title='Receita do Mês'
					value={`R$ ${data.receitaMes.toFixed(2)}`}
					icon={DollarSign}
					color='emerald'
					subtext='Baseado nas NFS-e emitidas'
				/>

				<DashboardCard
					title='Saldo do Mês'
					value={`R$ ${data.saldoMes.toFixed(2)}`}
					icon={Activity}
					color='green'
				/>
			</div>

			{/* --- GRÁFICO E CARD LATERAL --- */}
			<div className='grid grid-cols-1 lg:grid-cols-3 gap-6'>
				{/* Gráfico Principal (Fluxo de Caixa dos últimos 6 meses) */}
				<div className='lg:col-span-2 bg-white p-6 rounded-xl shadow-sm border border-gray-100'>
					<div className='flex items-center gap-2 mb-6'>
						<TrendingUp size={20} className='text-emerald-500' />
						<h3 className='font-bold text-gray-800'>
							Fluxo de Caixa (6 meses)
						</h3>
					</div>

					{/* Gráfico responsivo usando Recharts */}
					<div className='h-[300px] w-full'>
						<ResponsiveContainer width='100%' height='100%'>
							{/* data.fluxoCaixa deve ser um array de objetos com { mes, valor } */}
							<AreaChart data={data.fluxoCaixa}>
								{/* Definição de gradiente para preencher a área do gráfico */}
								<defs>
									<linearGradient
										id='colorReceita'
										x1='0'
										y1='0'
										x2='0'
										y2='1'>
										<stop
											offset='5%'
											stopColor='#10b981'
											stopOpacity={0.1}
										/>
										<stop
											offset='95%'
											stopColor='#10b981'
											stopOpacity={0}
										/>
									</linearGradient>
								</defs>

								{/* Grade de fundo do gráfico */}
								<CartesianGrid
									strokeDasharray='3 3'
									vertical={false}
									stroke='#f0f0f0'
								/>

								{/* Eixo X: exibe o campo "mes" (nome/abreviação do mês) */}
								<XAxis
									dataKey='mes'
									axisLine={false}
									tickLine={false}
									tick={{ fill: "#9ca3af", fontSize: 12 }}
									dy={10}
								/>

								{/* Eixo Y: valores em reais (formatter aqui está simplificado) */}
								<YAxis
									axisLine={false}
									tickLine={false}
									tick={{ fill: "#9ca3af", fontSize: 12 }}
									tickFormatter={(value) => `k`} // Placeholder simples para não poluir visual
								/>

								{/* Tooltip customizado para quando passa o mouse sobre o gráfico */}
								<Tooltip
									contentStyle={{
										borderRadius: "8px",
										border: "none",
										boxShadow:
											"0 4px 6px -1px rgb(0 0 0 / 0.1)",
									}}
									formatter={(value) => [
										`R$ ${value.toFixed(2)}`,
										"Receita",
									]}
								/>

								{/* Área da Receita (linha + preenchimento em degradê) */}
								<Area
									type='monotone'
									dataKey='valor'
									stroke='#10b981'
									strokeWidth={3}
									fillOpacity={1}
									fill='url(#colorReceita)'
								/>
							</AreaChart>
						</ResponsiveContainer>
					</div>
				</div>

				{/* Card Lateral (placeholder para futuro gráfico de tipos de atendimento) */}
				<div className='bg-white p-6 rounded-xl shadow-sm border border-gray-100'>
					<h3 className='font-bold text-gray-800 mb-6'>
						Atendimentos por Tipo
					</h3>
					<div className='flex flex-col items-center justify-center h-[250px] text-gray-400 text-sm border-2 border-dashed border-gray-100 rounded-lg'>
						<p>Em breve: Gráfico de Pizza</p>
					</div>
				</div>
			</div>
		</main>
	);
}

// Componente auxiliar para os Cards (deixa o JSX do Dashboard mais limpo)
function DashboardCard({ title, value, icon: Icon, color, subtext }) {
	// Mapeia nomes de cores para classes Tailwind usadas no ícone
	const colors = {
		blue: "bg-blue-50 text-blue-600",
		purple: "bg-purple-50 text-purple-600",
		emerald: "bg-emerald-50 text-emerald-600",
		green: "bg-green-50 text-green-600",
	};

	return (
		<div className='bg-white p-6 rounded-xl shadow-sm border border-gray-100 transition-all hover:shadow-md'>
			<div className='flex justify-between items-start'>
				<div>
					{/* Título do card */}
					<p className='text-sm font-medium text-gray-500 mb-1'>
						{title}
					</p>
					{/* Valor principal (número, dinheiro etc.) */}
					<h3 className='text-2xl font-bold text-gray-900'>{value}</h3>
					{/* Texto complementar opcional (quando subtext é passado) */}
					{subtext && (
						<p className='text-xs text-emerald-600 mt-2 font-medium'>
							{subtext}
						</p>
					)}
				</div>
				{/* Ícone do card com cor de fundo baseada na prop "color" */}
				<div className={`p-3 rounded-lg ${colors[color]}`}>
					<Icon size={24} />
				</div>
			</div>
		</div>
	);
}
