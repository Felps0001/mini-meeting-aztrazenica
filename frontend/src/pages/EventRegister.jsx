import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import api from "../services/api";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import "./EventRegister.css";

const EventRegister = () => {
  const { token } = useParams();
  const [event, setEvent] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [form, setForm] = useState({ name: "", email: "" });

  useEffect(() => {
    api
      .get(`/meetings/invite/${token}`)
      .then((res) => setEvent(res.data))
      .catch((err) =>
        setError(err.response?.data?.message || "Evento não encontrado"),
      )
      .finally(() => setLoading(false));
  }, [token]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      await api.post(`/meetings/invite/${token}/register`, { ...form });
      setSuccess(true);
    } catch (err) {
      setError(err.response?.data?.message || "Erro ao realizar inscrição");
    } finally {
      setSubmitting(false);
    }
  };

  if (loading)
    return (
      <div className="event-page">
        <div className="event-card">
          <p>Carregando...</p>
        </div>
      </div>
    );

  if (error)
    return (
      <div className="event-page">
        <div className="event-card">
          <div className="event-icon">❌</div>
          <h2>Evento indisponível</h2>
          <p className="error-msg">{error}</p>
        </div>
      </div>
    );

  if (success)
    return (
      <div className="event-page">
        <div className="event-card">
          <div className="event-icon">✅</div>
          <h2>Inscrição realizada!</h2>
          <p>
            Você foi inscrito com sucesso em <strong>{event.title}</strong>.
          </p>
          <p>Nos vemos lá! 🎉</p>
        </div>
      </div>
    );

  return (
    <div className="event-page">
      <div className="event-card">
        <div className="event-header">
          <div className="event-icon">📋</div>
          <h1>{event.title}</h1>
          {event.description && (
            <p className="event-description">{event.description}</p>
          )}
        </div>

        <div className="event-info">
          <div className="event-info-item">
            <span>📍</span>
            <span>{event.location}</span>
          </div>
          <div className="event-info-item">
            <span>📅</span>
            <span>
              {format(new Date(event.date), "dd 'de' MMMM 'de' yyyy", {
                locale: ptBR,
              })}
            </span>
          </div>
          <div className="event-info-item">
            <span>🕐</span>
            <span>
              {event.startTime}
              {event.endTime ? ` às ${event.endTime}` : ""}
            </span>
          </div>
          <div className="event-info-item">
            <span>👤</span>
            <span>Organizado por {event.organizer}</span>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="event-form">
          <h3>Sua inscrição</h3>
          <div className="form-group">
            <label>Nome completo *</label>
            <input
              type="text"
              value={form.name}
              onChange={(e) => setForm((p) => ({ ...p, name: e.target.value }))}
              placeholder="Seu nome completo"
              required
            />
          </div>
          <div className="form-group">
            <label>Email *</label>
            <input
              type="email"
              value={form.email}
              onChange={(e) =>
                setForm((p) => ({ ...p, email: e.target.value }))
              }
              placeholder="seu@email.com"
              required
            />
          </div>

          {error && <div className="error-msg">{error}</div>}

          <button
            type="submit"
            className="btn-primary btn-full"
            disabled={submitting}
          >
            {submitting ? "Inscrevendo..." : "✅ Confirmar inscrição"}
          </button>
        </form>
      </div>
    </div>
  );
};

export default EventRegister;
