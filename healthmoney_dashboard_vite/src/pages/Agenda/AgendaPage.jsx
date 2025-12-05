import React, { useState, useEffect } from "react";
import { Plus, X, Loader2 } from "lucide-react";
import { Calendar, dateFnsLocalizer } from "react-big-calendar";
import format from "date-fns/format";
import parse from "date-fns/parse";
import startOfWeek from "date-fns/startOfWeek";
import getDay from "date-fns/getDay";
import ptBR from "date-fns/locale/pt-BR";
import "react-big-calendar/lib/css/react-big-calendar.css";

// Configuração do Localizer da biblioteca react-big-calendar
// Necessário para permitir datas com formatação e idioma PT-BR usando date-fns
const locales = { "pt-BR": ptBR };
const localizer = dateFnsLocalizer({
	format, // Função para formatar datas
	parse, // Função para converter string em Date
	startOfWeek: () => startOfWeek(new Date(), { weekStartsOn: 0 }), // Semana começa no domingo
	getDay, // Obtém o dia da semana
	locales, // Idioma configurado
});

// Textos traduzidos usados pelo calendário
const messages = {
	allDay: "Dia todo",
	previous: "<",
	next: ">",
	today: "Hoje",
	month: "Mês",
	week: "Semana",
	day: "Dia",
	agenda: "Agenda",
	date: "Data",
	time: "Hora",
	event: "Evento",
	noEventsInRange: "Não há eventos neste período.",
	showMore: (total) => `+ Ver mais (${total})`,
};

export default function AgendaPage() {
	// Lista de eventos exibidos no calendário
	const [events, setEvents] = useState([]);

	// Controle de abertura/fechamento do modal
	const [isModalOpen, setIsModalOpen] = useState(false);

	// Estado de loading para bloquear botão e mostrar ícone de carregamento
	const [loading, setLoading] = useState(false);

	// Estado do formulário de novo agendamento
	const [novoEvento, setNovoEvento] = useState({
		titulo: "",
		dataInicio: "",
		horaInicio: "",
		horaFim: "",
		descricao: "",
		emailPaciente: "",
	});

	// Estado para armazenar erros de validação dos campos
	const [errors, setErrors] = useState({});

	// Função responsável por buscar eventos na API
	const fetchEvents = async () => {
		try {
			const response = await fetch("/api/agenda/listar");

			// Se a sessão expirou, redireciona para login
			if (response.status === 401) {
				console.warn("Sessão expirada. Redirecionando...");
				window.location.href = "/login";
				return;
			}

			if (response.ok) {
				const data = await response.json();

				// Conversão dos eventos recebidos para o formato exigido pelo calendário
				const eventosFormatados = data.map((evt) => ({
					title: evt.titulo,
					start: new Date(evt.inicio),
					end: new Date(evt.fim || evt.inicio),
					resource: evt, // Guarda o evento original caso precise usar depois
				}));

				setEvents(eventosFormatados);
			} else {
				console.error("Erro na resposta da API:", response.status);
			}
		} catch (error) {
			console.error("Erro ao buscar agenda:", error);
		}
	};

	// Executa fetchEvents ao renderizar a página pela primeira vez
	useEffect(() => {
		fetchEvents();
	}, []);

	// Validação dos campos do formulário de agendamento
	const validateForm = () => {
		const newErrors = {};
		const now = new Date(); // Data e hora atual para validações

		// 1. Validação do título
		if (!novoEvento.titulo.trim()) {
			newErrors.titulo = "O título é obrigatório.";
		} else if (novoEvento.titulo.length > 255) {
			newErrors.titulo = "O título não pode ter mais de 255 caracteres.";
		}

		// 2. Validação para garantir que a data e hora não sejam no passado
		if (novoEvento.dataInicio && novoEvento.horaInicio) {
			const inicioDateTime = new Date(
				`${novoEvento.dataInicio}T${novoEvento.horaInicio}`
			);
			if (inicioDateTime < now) {
				newErrors.dataInicio = "A data e hora não podem ser no passado.";
			}
		}

		// 3. Hora final deve ser maior que a hora inicial
		if (novoEvento.horaInicio && novoEvento.horaFim) {
			const inicio = new Date(`2000-01-01T${novoEvento.horaInicio}`);
			const fim = new Date(`2000-01-01T${novoEvento.horaFim}`);

			if (fim <= inicio) {
				newErrors.horaFim = "A hora final deve ser maior que a inicial.";
			}
		}

		// 4. Validação de email obrigatório e com formato correto
		const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
		if (!novoEvento.emailPaciente) {
			newErrors.emailPaciente = "O e-mail do paciente é obrigatório.";
		} else if (!emailRegex.test(novoEvento.emailPaciente)) {
			newErrors.emailPaciente = "Insira um e-mail válido.";
		}

		setErrors(newErrors);

		// Retorna true se não houver erros
		return Object.keys(newErrors).length === 0;
	};

	// Função executada ao enviar o formulário de agendamento
	const handleSubmit = async (e) => {
		e.preventDefault(); // Impede reload da página

		// Só continua se os dados forem válidos
		if (!validateForm()) {
			return;
		}

		setLoading(true); // Ativa indicador de envio

		// Converte data + horário para formato ISO e envia para o backend
		const dataInicioISO = `${novoEvento.dataInicio}T${novoEvento.horaInicio}:00`;
		const dataFimISO = `${novoEvento.dataInicio}T${novoEvento.horaFim}:00`;

		// Objeto enviado para a API
		const payload = {
			titulo: novoEvento.titulo,
			dataInicio: dataInicioISO,
			dataFim: dataFimISO,
			descricao: novoEvento.descricao,
			emailPaciente: novoEvento.emailPaciente,
		};

		try {
			const response = await fetch("/api/agenda/criar", {
				method: "POST",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify(payload),
			});

			// Sessão expirada
			if (response.status === 401) {
				window.location.href = "/login";
				return;
			}

			if (response.ok) {
				alert("Agendamento criado com sucesso!");
				setIsModalOpen(false); // Fecha modal

				// Reseta formulário
				setNovoEvento({
					titulo: "",
					dataInicio: "",
					horaInicio: "",
					horaFim: "",
					descricao: "",
					emailPaciente: "",
				});

				setErrors({}); // Limpa erros
				fetchEvents(); // Atualiza lista do calendário
			} else {
				alert("Erro ao criar evento. Tente novamente.");
			}
		} catch (error) {
			console.error("Erro:", error);
		} finally {
			setLoading(false); // Envio finalizado
		}
	};

	return (
		<main className='flex-1 ml-64 p-8 relative'>
			{/* Cabeçalho da página com botão para criar novo atendimento */}
			<header className='flex justify-between items-center mb-8'>
				<div>
					<h2 className='text-3xl font-bold text-gray-900'>Agenda</h2>
					<p className='text-gray-500 mt-1'>Gerencie seus atendimentos</p>
				</div>

				{/* Botão que abre o modal */}
				<button
					onClick={() => {
						setIsModalOpen(true);
						setErrors({}); // Limpa erros ao abrir o modal
					}}
					className='flex items-center gap-2 bg-emerald-500 text-white px-4 py-2 rounded-lg font-medium hover:bg-emerald-600 transition-colors'>
					<Plus size={16} />
					Novo Atendimento
				</button>
			</header>

			{/* Calendário principal */}
			<div className='bg-white p-6 rounded-xl shadow-sm border border-gray-100'>
				<Calendar
					localizer={localizer} // Localização configurada (PT-BR)
					events={events} // Lista de eventos
					messages={messages} // Textos traduzidos
					culture='pt-BR'
					startAccessor='start' // Campo onde o calendário lê a data inicial
					endAccessor='end' // Campo onde o calendário lê a data final
					defaultView='month'
					views={["month", "week", "day"]}
					style={{ height: "700px" }}
					className='font-sans text-gray-600'
					eventPropGetter={(event) => ({
						// Estilização dos eventos no calendário
						style: {
							backgroundColor: "#10b981",
							borderRadius: "4px",
							border: "none",
							color: "white",
							fontSize: "0.85rem",
						},
					})}
				/>
			</div>

			{/* Modal de criação de agendamento */}
			{isModalOpen && (
				<div className='fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4'>
					<div className='bg-white rounded-xl shadow-2xl w-full max-w-md overflow-hidden animate-in fade-in zoom-in duration-200'>
						{/* Cabeçalho do modal */}
						<div className='flex justify-between items-center p-5 border-b'>
							<h3 className='text-xl font-bold text-gray-800'>
								Novo Agendamento
							</h3>
							<button
								onClick={() => setIsModalOpen(false)}
								className='text-gray-400 hover:text-gray-600'>
								<X size={24} />
							</button>
						</div>

						{/* Formulário */}
						<form onSubmit={handleSubmit} className='p-5 space-y-4'>
							{/* TÍTULO */}
							<div>
								<label className='block text-sm font-medium text-gray-700 mb-1'>
									Título / Paciente
								</label>
								<input
									type='text'
									maxLength={255} // Limita digitação
									className={`w-full border rounded-lg p-2 focus:ring-2 focus:ring-emerald-500 outline-none ${
										errors.titulo ? "border-red-500" : "border-gray-300"
									}`}
									value={novoEvento.titulo}
									onChange={(e) =>
										setNovoEvento({
											...novoEvento,
											titulo: e.target.value,
										})
									}
									placeholder='Ex: Consulta João Silva'
								/>
								{errors.titulo && (
									<p className='text-xs text-red-500 mt-1'>
										{errors.titulo}
									</p>
								)}
							</div>

							{/* DATA */}
							<div className='grid grid-cols-2 gap-4'>
								<div>
									<label className='block text-sm font-medium text-gray-700 mb-1'>
										Data
									</label>
									<input
										required
										type='date'
										className={`w-full border rounded-lg p-2 focus:ring-2 focus:ring-emerald-500 outline-none ${
											errors.dataInicio ? "border-red-500" : "border-gray-300"
										}`}
										value={novoEvento.dataInicio}
										onChange={(e) =>
											setNovoEvento({
												...novoEvento,
												dataInicio: e.target.value,
											})
										}
									/>
									{errors.dataInicio && (
										<p className='text-xs text-red-500 mt-1'>
											{errors.dataInicio}
										</p>
									)}
								</div>
								{/* Coluna vazia apenas para ajuste visual */}
								<div></div>
							</div>

							{/* HORÁRIOS */}
							<div className='grid grid-cols-2 gap-4'>
								<div>
									<label className='block text-sm font-medium text-gray-700 mb-1'>
										Início
									</label>
									<input
										required
										type='time'
										className='w-full border border-gray-300 rounded-lg p-2 focus:ring-2 focus:ring-emerald-500 outline-none'
										value={novoEvento.horaInicio}
										onChange={(e) =>
											setNovoEvento({
												...novoEvento,
												horaInicio: e.target.value,
											})
										}
									/>
								</div>

								<div>
									<label className='block text-sm font-medium text-gray-700 mb-1'>
										Fim
									</label>
									<input
										required
										type='time'
										className={`w-full border rounded-lg p-2 focus:ring-2 focus:ring-emerald-500 outline-none ${
											errors.horaFim ? "border-red-500" : "border-gray-300"
										}`}
										value={novoEvento.horaFim}
										onChange={(e) =>
											setNovoEvento({
												...novoEvento,
												horaFim: e.target.value,
											})
										}
									/>
									{errors.horaFim && (
										<p className='text-xs text-red-500 mt-1'>
											{errors.horaFim}
										</p>
									)}
								</div>
							</div>

							{/* EMAIL */}
							<div>
								<label className='block text-sm font-medium text-gray-700 mb-1'>
									Email do Paciente (Convite){" "}
									<span className='text-red-500'>*</span>
								</label>
								<input
									type='email'
									className={`w-full border rounded-lg p-2 focus:ring-2 focus:ring-emerald-500 outline-none ${
										errors.emailPaciente
											? "border-red-500"
											: "border-gray-300"
									}`}
									placeholder='paciente@email.com'
									value={novoEvento.emailPaciente}
									onChange={(e) =>
										setNovoEvento({
											...novoEvento,
											emailPaciente: e.target.value,
										})
									}
								/>
								{errors.emailPaciente && (
									<p className='text-xs text-red-500 mt-1'>
										{errors.emailPaciente}
									</p>
								)}
							</div>

							{/* OBSERVAÇÕES */}
							<div>
								<label className='block text-sm font-medium text-gray-700 mb-1'>
									Observações
								</label>
								<textarea
									className='w-full border border-gray-300 rounded-lg p-2 focus:ring-2 focus:ring-emerald-500 outline-none'
									rows='3'
									value={novoEvento.descricao}
									onChange={(e) =>
										setNovoEvento({
											...novoEvento,
											descricao: e.target.value,
										})
									}></textarea>
							</div>

							{/* BOTÃO DE CONFIRMAR */}
							<div className='pt-2'>
								<button
									type='submit'
									disabled={loading}
									className='w-full bg-emerald-500 text-white font-bold py-3 rounded-lg hover:bg-emerald-600 transition-colors flex justify-center items-center gap-2'>
									{loading ? (
										// Ícone de carregamento
										<Loader2 className='animate-spin' />
									) : (
										"Confirmar Agendamento"
									)}
								</button>
							</div>
						</form>
					</div>
				</div>
			)}
		</main>
	);
}
