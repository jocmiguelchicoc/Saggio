import React, { useState, useRef } from 'react';
import { Upload, FileText, CheckCircle2, AlertCircle, ArrowRight, ShieldCheck, Loader2 } from 'lucide-react';
import { BottomSheet } from '../../common/BottomSheet.jsx';
import { parseAvVillasPDF } from '../../../core/avVillasParser.js';
import { formatCOP } from '../../../core/formatters.js';

export function UploadExtractModal({
  isOpen,
  onClose,
  credit,
  onConfirmSync,
}) {
  const [file, setFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [parsedData, setParsedData] = useState(null);
  const fileInputRef = useRef(null);

  const resetState = () => {
    setFile(null);
    setLoading(false);
    setError(null);
    setParsedData(null);
  };

  const handleClose = () => {
    resetState();
    onClose();
  };

  const handleFileChange = async (selectedFile) => {
    if (!selectedFile) return;

    if (selectedFile.type !== 'application/pdf' && !selectedFile.name.toLowerCase().endsWith('.pdf')) {
      setError('Por favor sube un archivo en formato PDF.');
      return;
    }

    setFile(selectedFile);
    setLoading(true);
    setError(null);
    setParsedData(null);

    try {
      const data = await parseAvVillasPDF(selectedFile);
      setParsedData(data);
    } catch (err) {
      console.error('Error al procesar PDF:', err);
      setError(
        err.message || 'No se pudo leer el extracto. Asegúrate de subir el PDF original de Banco AV Villas.'
      );
    } finally {
      setLoading(false);
    }
  };

  const handleConfirm = async () => {
    if (!parsedData) return;
    try {
      setLoading(true);
      await onConfirmSync(parsedData);
      handleClose();
    } catch (err) {
      setError(err.message || 'Error al guardar la sincronización.');
      setLoading(false);
    }
  };

  return (
    <BottomSheet isOpen={isOpen} onClose={handleClose} title="Sincronizar Extracto PDF">
      <div style={{ padding: '0 4px 16px' }}>
        <p style={{ fontSize: '0.82rem', color: 'var(--text-muted)', marginBottom: 16 }}>
          Sube el extracto oficial en PDF de tu <strong>Banco AV Villas</strong>. Tu dispositivo extraerá
          automáticamente el saldo exacto, cuotas pagadas, intereses y fechas para que nunca haya desviaciones.
        </p>

        {/* Zona de Drop / Carga de archivo */}
        {!parsedData && (
          <div
            onClick={() => fileInputRef.current?.click()}
            style={{
              border: '2px dashed var(--border-subtle)',
              borderRadius: 16,
              padding: '28px 20px',
              textAlign: 'center',
              backgroundColor: 'rgba(255, 255, 255, 0.02)',
              cursor: 'pointer',
              transition: 'border-color 0.2s',
              marginBottom: 16,
            }}
          >
            <input
              ref={fileInputRef}
              type="file"
              accept=".pdf,application/pdf"
              style={{ display: 'none' }}
              onChange={(e) => handleFileChange(e.target.files?.[0])}
            />

            {loading ? (
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 10 }}>
                <Loader2 size={32} className="spin" style={{ color: 'var(--accent-blue)' }} />
                <span style={{ fontSize: '0.85rem', color: 'var(--text-primary)', fontWeight: 600 }}>
                  Analizando extracto bancario en el navegador...
                </span>
                <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                  (100% privado: tu archivo nunca sale de tu teléfono)
                </span>
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 10 }}>
                <div
                  style={{
                    width: 48,
                    height: 48,
                    borderRadius: 14,
                    backgroundColor: 'rgba(59, 130, 246, 0.12)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: '#60a5fa',
                  }}
                >
                  <Upload size={24} />
                </div>
                <div>
                  <div style={{ fontSize: '0.9rem', fontWeight: 700, color: 'var(--text-primary)' }}>
                    Toca aquí para seleccionar tu PDF
                  </div>
                  <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: 4 }}>
                    Archivos .pdf descargados de AV Villas (ej. OCT-2026.pdf)
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Mensaje de error si falla */}
        {error && (
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 10,
              padding: '12px 14px',
              borderRadius: 12,
              backgroundColor: 'rgba(239, 68, 68, 0.1)',
              border: '1px solid rgba(239, 68, 68, 0.3)',
              color: '#f87171',
              fontSize: '0.8rem',
              marginBottom: 16,
            }}
          >
            <AlertCircle size={18} style={{ flexShrink: 0 }} />
            <span>{error}</span>
          </div>
        )}

        {/* Resumen de datos extraídos con éxito */}
        {parsedData && (
          <div style={{ marginBottom: 20 }}>
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 8,
                padding: '10px 14px',
                borderRadius: 12,
                backgroundColor: 'rgba(16, 185, 129, 0.12)',
                border: '1px solid rgba(16, 185, 129, 0.3)',
                color: '#34d399',
                fontSize: '0.8rem',
                fontWeight: 700,
                marginBottom: 14,
              }}
            >
              <CheckCircle2 size={16} />
              <span>Extracto validado: Corte {parsedData.fechaCorteFormatted}</span>
            </div>

            <div
              style={{
                backgroundColor: 'var(--bg-card)',
                borderRadius: 16,
                padding: '16px',
                border: '1px solid var(--border-subtle)',
                display: 'flex',
                flexDirection: 'column',
                gap: 12,
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>Saldo Capital Oficial</span>
                <span className="money tabular-nums" style={{ fontSize: '1.15rem', fontWeight: 800, color: 'var(--text-primary)' }}>
                  {formatCOP(parsedData.capitalTotal)}
                </span>
              </div>

              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>Cuotas Pagadas / Pendientes</span>
                <span style={{ fontSize: '0.85rem', fontWeight: 700, color: '#38bdf8' }}>
                  {parsedData.cuotasPagadas} de {parsedData.plazoPactado} ({parsedData.cuotasPendientes} restantes)
                </span>
              </div>

              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>Próxima Cuota</span>
                <span className="money tabular-nums" style={{ fontSize: '0.95rem', fontWeight: 700, color: '#fbbf24' }}>
                  {formatCOP(parsedData.proximaCuota)}
                </span>
              </div>

              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>Fecha Límite Pago</span>
                <span style={{ fontSize: '0.82rem', fontWeight: 600, color: 'var(--text-primary)' }}>
                  {parsedData.fechaLimitePago}
                </span>
              </div>

              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>Seguros de Cuota</span>
                <span style={{ fontSize: '0.82rem', fontWeight: 600, color: 'var(--text-muted)' }}>
                  {formatCOP(parsedData.totalSeguros)} (Vida + Desempleo)
                </span>
              </div>
            </div>

            <div style={{ display: 'flex', gap: 10, marginTop: 16 }}>
              <button
                type="button"
                onClick={resetState}
                className="btn-secondary"
                style={{ flex: 1, height: 46, fontSize: '0.85rem' }}
              >
                Elegir otro PDF
              </button>
              <button
                type="button"
                onClick={handleConfirm}
                disabled={loading}
                className="btn-primary"
                style={{ flex: 2, height: 46, fontSize: '0.85rem', fontWeight: 700 }}
              >
                {loading ? 'Sincronizando...' : 'Confirmar y Sincronizar'}
              </button>
            </div>
          </div>
        )}

        <div style={{ display: 'flex', justifyContent: 'center' }}>
          <button
            type="button"
            onClick={handleClose}
            style={{
              background: 'none',
              border: 'none',
              color: 'var(--text-muted)',
              fontSize: '0.8rem',
              cursor: 'pointer',
              padding: '6px 12px',
            }}
          >
            Cerrar sin guardar
          </button>
        </div>
      </div>
    </BottomSheet>
  );
}

