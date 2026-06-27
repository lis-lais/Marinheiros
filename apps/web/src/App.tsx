import React, { useState, useEffect, useCallback } from 'react';
import { 
  Calendar as CalendarIcon, 
  Mail, 
  LogOut, 
  Ship, 
  Bell, 
  Search, 
  RefreshCw, 
  ChevronLeft, 
  ChevronRight, 
  CheckCircle,
  HelpCircle,
  Briefcase
} from 'lucide-react';

// API Configuration
const API_BASE = '/marinheiros/api';

interface SailorInfo {
  id: string;
  fullName: string;
  email: string;
  rank: string;
}

interface CalendarDay {
  date: string;
  status: 'embarked' | 'off-duty';
}

interface PendingConfirmation {
  id: string;
  scheduledDate: string;
  transitionType: 'embark' | 'disembark';
  status: 'pending' | 'confirmed' | 'retified';
}

export default function App() {
  // Auth State
  const [token, setToken] = useState<string | null>(localStorage.getItem('sailor_token'));
  const [sailor, setSailor] = useState<SailorInfo | null>(() => {
    const saved = localStorage.getItem('sailor_info');
    return saved ? JSON.parse(saved) : null;
  });

  // Login/Register form states
  const [isRegisterMode, setIsRegisterMode] = useState(false);
  const [emailInput, setEmailInput] = useState('');
  const [passwordInput, setPasswordInput] = useState('');
  const [firstNameInput, setFirstNameInput] = useState('');
  const [lastNameInput, setLastNameInput] = useState('');
  const [rankInput, setRankInput] = useState('Praticante');
  const [authError, setAuthError] = useState('');

  // Dashboard states
  const [currentYear, setCurrentYear] = useState(new Date().getFullYear());
  const [currentMonth, setCurrentMonth] = useState(new Date().getMonth() + 1); // 1-indexed
  const [calendarDays, setCalendarDays] = useState<CalendarDay[]>([]);
  const [notifications, setNotifications] = useState<PendingConfirmation[]>([]);
  const [scaleInput, setScaleInput] = useState('14x21');
  const [lastEventDateInput, setLastEventDateInput] = useState('');
  const [lastEventTypeInput, setLastEventTypeInput] = useState<'embarked' | 'disembarked'>('disembarked');
  const [vesselNameInput, setVesselNameInput] = useState('');
  const [profileSuccessMsg, setProfileSuccessMsg] = useState('');
  const [profileErrorMsg, setProfileErrorMsg] = useState('');

  // Recalibration State
  const [confirmActualDate, setConfirmActualDate] = useState('');

  // Vacation Planner Search
  const [searchMinDays, setSearchMinDays] = useState(10);
  const [searchResults, setSearchResults] = useState<{ start: string; end: string; days: number }[]>([]);
  const [searchClicked, setSearchClicked] = useState(false);

  // General Loading
  const [isLoading, setIsLoading] = useState(false);

  // Helper fetch function
  const apiFetch = useCallback(async (path: string, options: RequestInit = {}) => {
    const headers = new Headers(options.headers || {});
    if (token) {
      headers.set('Authorization', `Bearer ${token}`);
    }
    if (options.body && !headers.has('Content-Type')) {
      headers.set('Content-Type', 'application/json');
    }
    const response = await fetch(`${API_BASE}${path}`, {
      ...options,
      headers
    });
    if (!response.ok) {
      const errorMsg = await response.text();
      throw new Error(errorMsg || 'HTTP error');
    }
    return response.json();
  }, [token]);

  // Auth Handlers
  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setAuthError('');
    setIsLoading(true);
    try {
      const data = await apiFetch('/auth/login', {
        method: 'POST',
        body: JSON.stringify({ email: emailInput, password: passwordInput })
      });
      localStorage.setItem('sailor_token', data.accessToken);
      localStorage.setItem('sailor_info', JSON.stringify(data.sailor));
      setToken(data.accessToken);
      setSailor(data.sailor);
    } catch (err: unknown) {
      const error = err as Error;
      setAuthError(error.message || 'Erro ao realizar login.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setAuthError('');
    setIsLoading(true);
    try {
      await apiFetch('/auth/register', {
        method: 'POST',
        body: JSON.stringify({
          firstName: firstNameInput,
          lastName: lastNameInput,
          rank: rankInput,
          email: emailInput,
          password: passwordInput
        })
      });
      // Register success, switch to login tab
      setIsRegisterMode(false);
      setPasswordInput('');
      alert('Cadastro realizado com sucesso! Insira suas credenciais para entrar.');
    } catch (err: unknown) {
      const error = err as Error;
      setAuthError(error.message || 'Erro ao realizar cadastro.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('sailor_token');
    localStorage.removeItem('sailor_info');
    setToken(null);
    setSailor(null);
  };

  // Fetch Dashboard Data (wrapped in useCallback)
  const fetchDashboardData = useCallback(async () => {
    if (!token) return;
    try {
      // 1. Get calendar projections
      const projections = await apiFetch(`/schedules/calendar?year=${currentYear}&month=${currentMonth}`);
      setCalendarDays(projections);

      // 2. Get pending confirmations/notifications
      const notifs = await apiFetch('/schedules/notifications');
      setNotifications(notifs);
    } catch (err: unknown) {
      console.error('Error fetching calendar data', err);
    }
  }, [token, currentYear, currentMonth, apiFetch]);

  // Trigger Cron Job to simulate time pass
  const handleTriggerCron = async () => {
    setIsLoading(true);
    try {
      await apiFetch('/schedules/trigger-cron', { method: 'POST' });
      await fetchDashboardData();
      alert('Simulador executado: o sistema varreu as escalas e atualizou as notificações!');
    } catch (err: unknown) {
      console.error('Error triggering cron', err);
      alert('Erro ao disparar simulador.');
    } finally {
      setIsLoading(false);
    }
  };

  // Update Profile Config
  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setProfileSuccessMsg('');
    setProfileErrorMsg('');
    try {
      await apiFetch('/schedules/profile', {
        method: 'POST',
        body: JSON.stringify({
          scale: scaleInput,
          lastEventDate: lastEventDateInput,
          lastEventType: lastEventTypeInput,
          vesselName: vesselNameInput
        })
      });
      setProfileSuccessMsg('Perfil de escala salvo com sucesso!');
      fetchDashboardData();
    } catch (err: unknown) {
      const error = err as Error;
      setProfileErrorMsg(error.message || 'Erro ao salvar escala.');
    }
  };

  // Confirm pending transition
  const handleConfirmTransition = async (pendingId: string) => {
    if (!confirmActualDate) {
      alert('Por favor, informe a data real do evento.');
      return;
    }
    try {
      await apiFetch('/schedules/confirm', {
        method: 'POST',
        body: JSON.stringify({
          pendingConfirmationId: pendingId,
          actualDate: confirmActualDate
        })
      });
      setConfirmActualDate('');
      fetchDashboardData();
      alert('Transição confirmada com sucesso! Projeções de escala recalculadas.');
    } catch (err: unknown) {
      const error = err as Error;
      alert(error.message || 'Erro ao confirmar transição.');
    }
  };

  // Run initial dashboard fetch and on month/year changes
  useEffect(() => {
    if (token) {
      fetchDashboardData();
    }
  }, [token, fetchDashboardData]);

  // Vacation search algorithm local representation
  const handleVacationSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setSearchClicked(true);
    setSearchResults([]);

    if (calendarDays.length === 0) {
      alert('Configure seu perfil de escala antes de planejar folgas.');
      return;
    }

    const blocks: { start: string; end: string; days: number }[] = [];
    let currentBlock: string[] = [];

    calendarDays.forEach((day) => {
      if (day.status === 'off-duty') {
        currentBlock.push(day.date);
      } else {
        if (currentBlock.length >= searchMinDays) {
          blocks.push({
            start: currentBlock[0],
            end: currentBlock[currentBlock.length - 1],
            days: currentBlock.length
          });
        }
        currentBlock = [];
      }
    });

    if (currentBlock.length >= searchMinDays) {
      blocks.push({
        start: currentBlock[0],
        end: currentBlock[currentBlock.length - 1],
        days: currentBlock.length
      });
    }

    setSearchResults(blocks);
  };

  // Calendar render helpers
  const monthNames = [
    'Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho',
    'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'
  ];

  const handlePrevMonth = () => {
    if (currentMonth === 1) {
      setCurrentMonth(12);
      setCurrentYear(currentYear - 1);
    } else {
      setCurrentMonth(currentMonth - 1);
    }
  };

  const handleNextMonth = () => {
    if (currentMonth === 12) {
      setCurrentMonth(1);
      setCurrentYear(currentYear + 1);
    } else {
      setCurrentMonth(currentMonth + 1);
    }
  };

  // Generate blank calendar days for alignment
  const renderBlankDays = () => {
    const firstDay = new Date(Date.UTC(currentYear, currentMonth - 1, 1));
    const dayOfWeek = firstDay.getUTCDay(); // 0 is Sunday, 1 is Monday...
    const blanks = [];
    // Adjust week start to Monday (1)
    const adjustedDay = dayOfWeek === 0 ? 6 : dayOfWeek - 1;
    for (let i = 0; i < adjustedDay; i++) {
      blanks.push(<div key={`blank-${i}`} className="calendar-day empty"></div>);
    }
    return blanks;
  };

  // Is a date highlighted in the vacation search results?
  const isDateHighlighted = (dateStr: string) => {
    return searchResults.some(block => {
      const date = new Date(dateStr);
      const start = new Date(block.start);
      const end = new Date(block.end);
      return date >= start && date <= end;
    });
  };

  // Render Login/Register
  if (!token || !sailor) {
    return (
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '100vh', padding: '20px' }}>
        <div className="glass-panel fade-in" style={{ width: '100%', maxWidth: '420px', padding: '32px' }}>
          <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '24px' }}>
            <div style={{ background: 'rgba(0, 180, 216, 0.15)', padding: '16px', borderRadius: '50%', color: 'var(--btn-primary)' }}>
              <Ship size={36} />
            </div>
          </div>
          
          <h2 style={{ textAlign: 'center', marginBottom: '8px', fontSize: '1.75rem', fontWeight: 700 }}>
            Marinheiros
          </h2>
          <p style={{ textAlign: 'center', color: 'var(--text-secondary)', marginBottom: '32px', fontSize: '0.95rem' }}>
            Controle de Escala Preditivo e Calibração
          </p>

          <div style={{ display: 'flex', marginBottom: '24px', borderBottom: '1px solid var(--border-card)' }}>
            <button 
              onClick={() => { setIsRegisterMode(false); setAuthError(''); }}
              style={{ 
                flex: 1, padding: '12px', background: 'none', border: 'none', 
                color: !isRegisterMode ? 'var(--btn-primary)' : 'var(--text-secondary)',
                fontWeight: !isRegisterMode ? 600 : 400,
                borderBottom: !isRegisterMode ? '2px solid var(--btn-primary)' : 'none',
                cursor: 'pointer'
              }}
            >
              Entrar
            </button>
            <button 
              onClick={() => { setIsRegisterMode(true); setAuthError(''); }}
              style={{ 
                flex: 1, padding: '12px', background: 'none', border: 'none', 
                color: isRegisterMode ? 'var(--btn-primary)' : 'var(--text-secondary)',
                fontWeight: isRegisterMode ? 600 : 400,
                borderBottom: isRegisterMode ? '2px solid var(--btn-primary)' : 'none',
                cursor: 'pointer'
              }}
            >
              Cadastrar
            </button>
          </div>

          {authError && (
            <div style={{ padding: '12px', borderRadius: 'var(--radius-sm)', background: 'rgba(239, 68, 68, 0.15)', border: '1px solid rgba(239, 68, 68, 0.3)', color: '#fca5a5', marginBottom: '20px', fontSize: '0.875rem' }}>
              {authError}
            </div>
          )}

          {isRegisterMode ? (
            <form onSubmit={handleRegister} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <div style={{ display: 'flex', gap: '12px' }}>
                <div>
                  <label style={{ display: 'block', marginBottom: '6px', fontSize: '0.85rem', color: 'var(--text-secondary)' }}>Nome</label>
                  <input required className="input-field" type="text" value={firstNameInput} onChange={(e) => setFirstNameInput(e.target.value)} />
                </div>
                <div>
                  <label style={{ display: 'block', marginBottom: '6px', fontSize: '0.85rem', color: 'var(--text-secondary)' }}>Sobrenome</label>
                  <input required className="input-field" type="text" value={lastNameInput} onChange={(e) => setLastNameInput(e.target.value)} />
                </div>
              </div>
              <div>
                <label style={{ display: 'block', marginBottom: '6px', fontSize: '0.85rem', color: 'var(--text-secondary)' }}>Patente / Rank</label>
                <select className="input-field" value={rankInput} onChange={(e) => setRankInput(e.target.value)}>
                  <option value="Comandante">Comandante</option>
                  <option value="Imediato">Imediato</option>
                  <option value="Chefe de Máquinas">Chefe de Máquinas</option>
                  <option value="Cabo">Cabo</option>
                  <option value="Marinheiro de Convés">Marinheiro de Convés</option>
                  <option value="Praticante">Praticante</option>
                </select>
              </div>
              <div>
                <label style={{ display: 'block', marginBottom: '6px', fontSize: '0.85rem', color: 'var(--text-secondary)' }}>E-mail</label>
                <div style={{ position: 'relative' }}>
                  <Mail size={18} style={{ position: 'absolute', left: '14px', top: '14px', color: 'var(--text-muted)' }} />
                  <input required className="input-field" style={{ paddingLeft: '44px' }} type="email" value={emailInput} onChange={(e) => setEmailInput(e.target.value)} />
                </div>
              </div>
              <div>
                <label style={{ display: 'block', marginBottom: '6px', fontSize: '0.85rem', color: 'var(--text-secondary)' }}>Senha</label>
                <div style={{ position: 'relative' }}>
                  <Mail size={18} style={{ position: 'absolute', left: '14px', top: '14px', color: 'var(--text-muted)' }} />
                  <input required className="input-field" style={{ paddingLeft: '44px' }} type="password" value={passwordInput} onChange={(e) => setPasswordInput(e.target.value)} />
                </div>
              </div>
              <button disabled={isLoading} type="submit" className="btn btn-primary" style={{ marginTop: '8px' }}>
                {isLoading ? 'Cadastrando...' : 'Criar Conta'}
              </button>
            </form>
          ) : (
            <form onSubmit={handleLogin} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
              <div>
                <label style={{ display: 'block', marginBottom: '6px', fontSize: '0.85rem', color: 'var(--text-secondary)' }}>E-mail</label>
                <div style={{ position: 'relative' }}>
                  <Mail size={18} style={{ position: 'absolute', left: '14px', top: '14px', color: 'var(--text-muted)' }} />
                  <input required className="input-field" style={{ paddingLeft: '44px' }} type="email" value={emailInput} onChange={(e) => setEmailInput(e.target.value)} />
                </div>
              </div>
              <div>
                <label style={{ display: 'block', marginBottom: '6px', fontSize: '0.85rem', color: 'var(--text-secondary)' }}>Senha</label>
                <div style={{ position: 'relative' }}>
                  <Mail size={18} style={{ position: 'absolute', left: '14px', top: '14px', color: 'var(--text-muted)' }} />
                  <input required className="input-field" style={{ paddingLeft: '44px' }} type="password" value={passwordInput} onChange={(e) => setPasswordInput(e.target.value)} />
                </div>
              </div>
              <button disabled={isLoading} type="submit" className="btn btn-primary" style={{ marginTop: '8px' }}>
                {isLoading ? 'Entrando...' : 'Entrar'}
              </button>
            </form>
          )}
        </div>
      </div>
    );
  }

  // Render Dashboard
  return (
    <div>
      {/* Header */}
      <header style={{ borderBottom: '1px solid var(--border-card)', background: 'rgba(16, 31, 66, 0.4)', backdropFilter: 'blur(8px)' }}>
        <div className="container" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '16px 24px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <div style={{ color: 'var(--btn-primary)' }}>
              <Ship size={28} />
            </div>
            <div>
              <h1 style={{ fontSize: '1.25rem', fontWeight: 700 }}>MaréRotativa</h1>
              <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>Navegação de Escalas</span>
            </div>
          </div>
          
          <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
            <div style={{ textAlign: 'right' }}>
              <div style={{ fontWeight: 600, fontSize: '0.95rem' }}>{sailor.fullName}</div>
              <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>{sailor.rank}</div>
            </div>
            
            <button onClick={handleLogout} className="btn btn-secondary" style={{ padding: '8px 12px', borderRadius: 'var(--radius-sm)' }}>
              <LogOut size={16} />
              <span className="header-logout-text">Sair</span>
            </button>
          </div>
        </div>
      </header>

      {/* Main Content Grid */}
      <main className="container" style={{ marginTop: '16px' }}>
        
        {/* Pending Notifications Banner */}
        {notifications.length > 0 && (
          <div className="glass-panel fade-in" style={{ padding: '20px', borderLeft: '4px solid var(--color-pending)', marginBottom: '24px', background: 'rgba(247, 127, 0, 0.08)' }}>
            <div style={{ display: 'flex', gap: '16px', alignItems: 'flex-start' }}>
              <div style={{ color: 'var(--color-pending)', marginTop: '2px' }}>
                <Bell size={24} className="pulse-border" />
              </div>
              <div style={{ flex: 1 }}>
                <h3 style={{ fontSize: '1.1rem', fontWeight: 600, marginBottom: '6px', color: '#ffb703' }}>
                  Calibração de Escala Requerida
                </h3>
                {notifications.map((notif) => {
                  const transitionLabel = notif.transitionType === 'embark' ? 'Embarque' : 'Desembarque';
                  const dateFormatted = new Date(notif.scheduledDate).toLocaleDateString('pt-BR');
                  return (
                    <div key={notif.id} style={{ marginBottom: '12px' }}>
                      <p style={{ color: 'var(--text-primary)', fontSize: '0.95rem', marginBottom: '12px' }}>
                        Consta em nosso sistema a previsão de seu <strong>{transitionLabel}</strong> em <strong>{dateFormatted}</strong>. Por favor, confirme a data real do evento abaixo:
                      </p>
                      <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap', alignItems: 'center' }}>
                        <input 
                          type="date" 
                          className="input-field" 
                          style={{ maxWidth: '200px' }} 
                          value={confirmActualDate}
                          onChange={(e) => setConfirmActualDate(e.target.value)} 
                        />
                        <button 
                          onClick={() => handleConfirmTransition(notif.id)} 
                          className="btn btn-primary" 
                          style={{ background: 'var(--color-pending)', boxShadow: 'none' }}
                        >
                          <CheckCircle size={16} /> Confirmar Data Real
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        )}

        <div className="grid-2">
          {/* Left panel: Config and search */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
            
            {/* 1. Setup Profile Panel */}
            <section className="glass-panel" style={{ padding: '24px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '18px' }}>
                <Briefcase size={20} style={{ color: 'var(--btn-primary)' }} />
                <h3 style={{ fontSize: '1.15rem', fontWeight: 600 }}>Configuração da Escala</h3>
              </div>

              {profileSuccessMsg && (
                <div style={{ padding: '10px', background: 'rgba(45, 106, 79, 0.15)', border: '1px solid rgba(45, 106, 79, 0.3)', color: '#b7e4c7', borderRadius: 'var(--radius-sm)', fontSize: '0.85rem', marginBottom: '12px' }}>
                  {profileSuccessMsg}
                </div>
              )}
              {profileErrorMsg && (
                <div style={{ padding: '10px', background: 'rgba(239, 68, 68, 0.15)', border: '1px solid rgba(239, 68, 68, 0.3)', color: '#fca5a5', borderRadius: 'var(--radius-sm)', fontSize: '0.85rem', marginBottom: '12px' }}>
                  {profileErrorMsg}
                </div>
              )}

              <form onSubmit={handleUpdateProfile} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                <div>
                  <label style={{ display: 'block', marginBottom: '6px', fontSize: '0.85rem', color: 'var(--text-secondary)' }}>Escala de Trabalho</label>
                  <select className="input-field" value={scaleInput} onChange={(e) => setScaleInput(e.target.value)}>
                    <option value="14x21">14 dias Embarcado x 21 dias Folga</option>
                    <option value="28x28">28 dias Embarcado x 28 dias Folga</option>
                    <option value="42x42">42 dias Embarcado x 42 dias Folga</option>
                    <option value="14x14">14 dias Embarcado x 14 dias Folga</option>
                    <option value="360x60">360 dias Embarcado x 60 dias Folga</option>
                  </select>
                </div>
                <div>
                  <label style={{ display: 'block', marginBottom: '6px', fontSize: '0.85rem', color: 'var(--text-secondary)' }}>Data do Último Evento (Âncora)</label>
                  <input required className="input-field" type="date" value={lastEventDateInput} onChange={(e) => setLastEventDateInput(e.target.value)} />
                </div>
                <div>
                  <label style={{ display: 'block', marginBottom: '6px', fontSize: '0.85rem', color: 'var(--text-secondary)' }}>Tipo do Último Evento</label>
                  <select className="input-field" value={lastEventTypeInput} onChange={(e: React.ChangeEvent<HTMLSelectElement>) => setLastEventTypeInput(e.target.value as 'embarked' | 'disembarked')}>
                    <option value="disembarked">Desembarque (Início da Folga)</option>
                    <option value="embarked">Embarque (Início do Trabalho)</option>
                  </select>
                </div>
                <div>
                  <label style={{ display: 'block', marginBottom: '6px', fontSize: '0.85rem', color: 'var(--text-secondary)' }}>Nome da Embarcação / Navio</label>
                  <input className="input-field" type="text" placeholder="Ex: Ocean Pearl" value={vesselNameInput} onChange={(e) => setVesselNameInput(e.target.value)} />
                </div>
                <button type="submit" className="btn btn-primary">Salvar Perfil</button>
              </form>
            </section>

            {/* 2. Simulator and actions */}
            <section className="glass-panel" style={{ padding: '20px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '12px' }}>
                <RefreshCw size={18} style={{ color: 'var(--btn-primary)' }} />
                <h4 style={{ fontSize: '1rem', fontWeight: 600 }}>Ferramentas & Simulação</h4>
              </div>
              <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginBottom: '16px' }}>
                Use o simulador abaixo para rodar o Cron de transições do backend. Ele irá gerar alertas de confirmação caso sua escala prevista tenha virado o ciclo!
              </p>
              <button disabled={isLoading} onClick={handleTriggerCron} className="btn btn-secondary" style={{ width: '100%' }}>
                <RefreshCw size={16} /> Executar Cron de Transição
              </button>
            </section>

            {/* 3. Vacation Planner Search */}
            <section className="glass-panel" style={{ padding: '24px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '18px' }}>
                <Search size={20} style={{ color: 'var(--btn-primary)' }} />
                <h3 style={{ fontSize: '1.15rem', fontWeight: 600 }}>Planejador de Folga</h3>
              </div>
              <form onSubmit={handleVacationSearch} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                <div>
                  <label style={{ display: 'block', marginBottom: '6px', fontSize: '0.85rem', color: 'var(--text-secondary)' }}>Duração Mínima da Folga (Dias)</label>
                  <input 
                    type="number" 
                    min={1} 
                    className="input-field" 
                    value={searchMinDays} 
                    onChange={(e) => setSearchMinDays(parseInt(e.target.value, 10))} 
                  />
                </div>
                <button type="submit" className="btn btn-secondary" style={{ borderColor: 'var(--btn-primary)', color: '#90e0ef' }}>
                  Buscar Períodos Livres
                </button>
              </form>

              {searchClicked && (
                <div style={{ marginTop: '20px', borderTop: '1px solid var(--border-card)', paddingTop: '16px' }}>
                  <h4 style={{ fontSize: '0.9rem', fontWeight: 600, marginBottom: '12px' }}>Resultado da Procura:</h4>
                  {searchResults.length === 0 ? (
                    <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>Nenhum bloco contínuo de folga com a duração informada neste mês.</p>
                  ) : (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                      {searchResults.map((res, index) => {
                        const start = new Date(res.start).toLocaleDateString('pt-BR');
                        const end = new Date(res.end).toLocaleDateString('pt-BR');
                        return (
                          <div key={index} style={{ padding: '10px', background: 'rgba(45, 106, 79, 0.15)', border: '1px solid rgba(45, 106, 79, 0.3)', borderRadius: 'var(--radius-sm)', fontSize: '0.85rem' }}>
                            <strong>Folga de {res.days} dias:</strong> de {start} até {end}
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              )}
            </section>

          </div>

          {/* Right Panel: Calendar */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
            <section className="glass-panel" style={{ padding: '24px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
                <h3 style={{ fontSize: '1.25rem', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <CalendarIcon size={22} style={{ color: 'var(--btn-primary)' }} />
                  {monthNames[currentMonth - 1]} {currentYear}
                </h3>
                <div style={{ display: 'flex', gap: '8px' }}>
                  <button onClick={handlePrevMonth} className="btn btn-secondary" style={{ padding: '8px 12px' }}>
                    <ChevronLeft size={18} />
                  </button>
                  <button onClick={handleNextMonth} className="btn btn-secondary" style={{ padding: '8px 12px' }}>
                    <ChevronRight size={18} />
                  </button>
                </div>
              </div>

              {/* Legend */}
              <div style={{ display: 'flex', gap: '16px', flexWrap: 'wrap', marginBottom: '24px', fontSize: '0.8rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <div style={{ width: '12px', height: '12px', borderRadius: '4px', background: 'rgba(0, 119, 182, 0.25)', border: '1px solid rgba(0, 119, 182, 0.5)' }}></div>
                  <span style={{ color: '#90e0ef' }}>Trabalho (Embarcado)</span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <div style={{ width: '12px', height: '12px', borderRadius: '4px', background: 'rgba(45, 106, 79, 0.25)', border: '1px solid rgba(45, 106, 79, 0.5)' }}></div>
                  <span style={{ color: '#b7e4c7' }}>Folga</span>
                </div>
                {searchResults.length > 0 && (
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <div style={{ width: '12px', height: '12px', borderRadius: '4px', border: '2px solid gold', boxShadow: '0 0 8px gold' }}></div>
                    <span style={{ color: 'gold' }}>Folga Selecionada</span>
                  </div>
                )}
              </div>

              {calendarDays.length === 0 ? (
                <div style={{ textAlign: 'center', padding: '40px 0', color: 'var(--text-secondary)' }}>
                  <HelpCircle size={32} style={{ marginBottom: '12px', opacity: 0.5 }} />
                  <p>Por favor, informe sua escala de trabalho à esquerda para calcular e visualizar suas projeções no calendário.</p>
                </div>
              ) : (
                <div>
                  {/* Days of Week Headers */}
                  <div className="calendar-grid" style={{ marginBottom: '8px' }}>
                    {['Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb', 'Dom'].map((d) => (
                      <div key={d} className="calendar-header">{d}</div>
                    ))}
                  </div>
                  
                  {/* Grid Days */}
                  <div className="calendar-grid">
                    {renderBlankDays()}
                    {calendarDays.map((day) => {
                      const dateObj = new Date(day.date);
                      const dayNum = dateObj.getUTCDate();
                      const statusClass = day.status;
                      const isHighlighted = isDateHighlighted(day.date);
                      
                      return (
                        <div 
                          key={day.date} 
                          className={`calendar-day calendar-day-active ${statusClass}`}
                          style={isHighlighted ? { border: '2px solid gold', boxShadow: '0 0 10px rgba(255, 215, 0, 0.6)', transform: 'scale(1.03)', zIndex: 1 } : {}}
                          onClick={() => {
                            if (day.status === 'off-duty') {
                              alert(`Previsão para dia ${dayNum}/${currentMonth}: Folga!`);
                            } else {
                              alert(`Previsão para dia ${dayNum}/${currentMonth}: Embarcado de plantão!`);
                            }
                          }}
                        >
                          <span style={{ fontWeight: 600 }}>{dayNum}</span>
                          <span style={{ fontSize: '0.65rem', opacity: 0.75, textAlign: 'right' }}>
                            {day.status === 'embarked' ? 'Trab' : 'Folga'}
                          </span>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}
            </section>
          </div>
        </div>

      </main>
    </div>
  );
}
