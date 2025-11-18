
import React, { useState, useEffect } from 'react';
import { useSystemConfig } from '../hooks/useSystemConfig';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Loader2, Save, Settings as SettingsIcon } from 'lucide-react';

const SettingsPage: React.FC = () => {
  const { config, loading, updateConfig } = useSystemConfig();
  const [formData, setFormData] = useState({
    olie_hub_name: '',
    timezone: '',
    default_currency: ''
  });
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    if (config) {
      setFormData({
        olie_hub_name: config.olie_hub_name,
        timezone: config.timezone,
        default_currency: config.default_currency
      });
    }
  }, [config]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    await updateConfig(formData);
    setIsSaving(false);
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <Loader2 className="w-12 h-12 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-textPrimary flex items-center gap-3">
          <SettingsIcon className="h-8 w-8" />
          Configurações do Sistema
        </h1>
        <p className="text-textSecondary mt-1">Gerencie as configurações globais da plataforma.</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Geral</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label htmlFor="olie_hub_name" className="text-sm font-medium text-textPrimary">
                  Nome do Hub
                </label>
                <input
                  id="olie_hub_name"
                  name="olie_hub_name"
                  type="text"
                  value={formData.olie_hub_name}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-border rounded-md bg-background text-textPrimary focus:outline-none focus:ring-2 focus:ring-primary/50"
                  placeholder="Ex: Olie Hub"
                />
              </div>

              <div className="space-y-2">
                <label htmlFor="default_currency" className="text-sm font-medium text-textPrimary">
                  Moeda Padrão
                </label>
                <select
                  id="default_currency"
                  name="default_currency"
                  value={formData.default_currency}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-border rounded-md bg-background text-textPrimary focus:outline-none focus:ring-2 focus:ring-primary/50"
                >
                  <option value="BRL">Real Brasileiro (BRL)</option>
                  <option value="USD">Dólar Americano (USD)</option>
                  <option value="EUR">Euro (EUR)</option>
                </select>
              </div>

              <div className="space-y-2">
                <label htmlFor="timezone" className="text-sm font-medium text-textPrimary">
                  Fuso Horário
                </label>
                <select
                  id="timezone"
                  name="timezone"
                  value={formData.timezone}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-border rounded-md bg-background text-textPrimary focus:outline-none focus:ring-2 focus:ring-primary/50"
                >
                  <option value="America/Sao_Paulo">Brasília (GMT-3)</option>
                  <option value="UTC">UTC</option>
                  <option value="America/New_York">New York (EST)</option>
                </select>
              </div>
            </div>

            <div className="flex justify-end pt-4">
              <Button type="submit" disabled={isSaving}>
                {isSaving ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Salvando...
                  </>
                ) : (
                  <>
                    <Save className="mr-2 h-4 w-4" />
                    Salvar Alterações
                  </>
                )}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};

export default SettingsPage;
