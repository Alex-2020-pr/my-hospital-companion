import { useState, useEffect } from 'react';
import { Layout } from '@/components/Layout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { supabase } from '@/integrations/supabase/client';
import { useUserRole } from '@/hooks/useUserRole';
import { useToast } from '@/hooks/use-toast';
import { Navigate } from 'react-router-dom';
import { DollarSign, TrendingUp, Database, HardDrive } from 'lucide-react';

export const AdminCosts = () => {
  const { isSuperAdmin, loading: roleLoading } = useUserRole();
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);
  const [costs, setCosts] = useState<any[]>([]);
  const [currentMonth, setCurrentMonth] = useState('');
  const [formData, setFormData] = useState({
    supabase_storage_gb: 0,
    supabase_bandwidth_gb: 0,
    supabase_db_size_gb: 0,
    lovable_hosting_cost: 0,
    firebase_cost: 0
  });

  useEffect(() => {
    if (isSuperAdmin) {
      fetchCosts();
      const now = new Date();
      setCurrentMonth(`${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`);
    }
  }, [isSuperAdmin]);

  const fetchCosts = async () => {
    try {
      const { data, error } = await supabase
        .from('operational_costs')
        .select('*')
        .order('month_year', { ascending: false });

      if (error) throw error;
      setCosts(data || []);
    } catch (error) {
      console.error('Error fetching costs:', error);
      toast({
        title: 'Erro ao carregar custos',
        description: 'Não foi possível carregar os dados de custos.',
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
    }
  };

  const calculateSupabaseCost = () => {
    // Baseado na tabela de preços do Supabase
    const storageCost = formData.supabase_storage_gb * 0.021; // $0.021 por GB
    const bandwidthCost = formData.supabase_bandwidth_gb * 0.09; // $0.09 por GB
    const dbCost = formData.supabase_db_size_gb * 0.125; // $0.125 por GB
    return storageCost + bandwidthCost + dbCost;
  };

  const handleSave = async () => {
    try {
      const supabaseCost = calculateSupabaseCost();
      
      const { error } = await supabase
        .from('operational_costs')
        .upsert({
          month_year: currentMonth,
          ...formData,
          supabase_total_cost: supabaseCost
        });

      if (error) throw error;

      toast({
        title: 'Custos salvos',
        description: 'Os custos operacionais foram salvos com sucesso.'
      });

      fetchCosts();
    } catch (error) {
      console.error('Error saving costs:', error);
      toast({
        title: 'Erro ao salvar',
        description: 'Não foi possível salvar os custos.',
        variant: 'destructive'
      });
    }
  };

  if (roleLoading || loading) {
    return (
      <Layout title="Custos Operacionais">
        <div className="flex items-center justify-center min-h-[400px]">
          <p>Carregando...</p>
        </div>
      </Layout>
    );
  }

  if (!isSuperAdmin) {
    return <Navigate to="/" />;
  }

  const currentCost = costs[0];
  const previousCost = costs[1];
  const totalRevenue = costs.length * 500; // Exemplo: receita estimada

  return (
    <Layout title="Custos Operacionais">
      <div className="space-y-6">
        {/* Cards de Resumo */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Custo Total Mês Atual</CardTitle>
              <DollarSign className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                ${currentCost?.total_cost?.toFixed(2) || '0.00'}
              </div>
              {previousCost && (
                <p className="text-xs text-muted-foreground">
                  {currentCost.total_cost > previousCost.total_cost ? '+' : ''}
                  {((currentCost.total_cost - previousCost.total_cost) / previousCost.total_cost * 100).toFixed(1)}% vs mês anterior
                </p>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Storage Total</CardTitle>
              <HardDrive className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {currentCost?.supabase_storage_gb?.toFixed(2) || '0'} GB
              </div>
              <p className="text-xs text-muted-foreground">
                ${(currentCost?.supabase_storage_gb * 0.021 || 0).toFixed(2)} em custos
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Bandwidth</CardTitle>
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {currentCost?.supabase_bandwidth_gb?.toFixed(2) || '0'} GB
              </div>
              <p className="text-xs text-muted-foreground">
                ${(currentCost?.supabase_bandwidth_gb * 0.09 || 0).toFixed(2)} em custos
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Margem de Lucro</CardTitle>
              <Database className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {((totalRevenue - (currentCost?.total_cost || 0)) / totalRevenue * 100).toFixed(1)}%
              </div>
              <p className="text-xs text-muted-foreground">
                ${(totalRevenue - (currentCost?.total_cost || 0)).toFixed(2)} lucro
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Formulário de Input */}
        <Card>
          <CardHeader>
            <CardTitle>Registrar Custos do Mês</CardTitle>
            <CardDescription>
              Insira os dados de uso e custos para o mês atual
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="month">Mês/Ano</Label>
                <Input
                  id="month"
                  type="month"
                  value={currentMonth}
                  onChange={(e) => setCurrentMonth(e.target.value)}
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <Label htmlFor="storage">Storage (GB)</Label>
                <Input
                  id="storage"
                  type="number"
                  step="0.01"
                  value={formData.supabase_storage_gb}
                  onChange={(e) => setFormData({ ...formData, supabase_storage_gb: parseFloat(e.target.value) })}
                />
                <p className="text-xs text-muted-foreground mt-1">
                  Custo: ${(formData.supabase_storage_gb * 0.021).toFixed(2)}
                </p>
              </div>

              <div>
                <Label htmlFor="bandwidth">Bandwidth (GB)</Label>
                <Input
                  id="bandwidth"
                  type="number"
                  step="0.01"
                  value={formData.supabase_bandwidth_gb}
                  onChange={(e) => setFormData({ ...formData, supabase_bandwidth_gb: parseFloat(e.target.value) })}
                />
                <p className="text-xs text-muted-foreground mt-1">
                  Custo: ${(formData.supabase_bandwidth_gb * 0.09).toFixed(2)}
                </p>
              </div>

              <div>
                <Label htmlFor="db">Database Size (GB)</Label>
                <Input
                  id="db"
                  type="number"
                  step="0.01"
                  value={formData.supabase_db_size_gb}
                  onChange={(e) => setFormData({ ...formData, supabase_db_size_gb: parseFloat(e.target.value) })}
                />
                <p className="text-xs text-muted-foreground mt-1">
                  Custo: ${(formData.supabase_db_size_gb * 0.125).toFixed(2)}
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="hosting">Lovable Hosting ($)</Label>
                <Input
                  id="hosting"
                  type="number"
                  step="0.01"
                  value={formData.lovable_hosting_cost}
                  onChange={(e) => setFormData({ ...formData, lovable_hosting_cost: parseFloat(e.target.value) })}
                />
              </div>

              <div>
                <Label htmlFor="firebase">Firebase ($)</Label>
                <Input
                  id="firebase"
                  type="number"
                  step="0.01"
                  value={formData.firebase_cost}
                  onChange={(e) => setFormData({ ...formData, firebase_cost: parseFloat(e.target.value) })}
                />
              </div>
            </div>

            <div className="pt-4 border-t">
              <div className="flex justify-between items-center mb-4">
                <span className="font-semibold">Custo Total Calculado:</span>
                <span className="text-2xl font-bold">
                  ${(calculateSupabaseCost() + formData.lovable_hosting_cost + formData.firebase_cost).toFixed(2)}
                </span>
              </div>
              <Button onClick={handleSave} className="w-full">
                Salvar Custos
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Histórico */}
        <Card>
          <CardHeader>
            <CardTitle>Histórico de Custos</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {costs.map((cost) => (
                <div key={cost.id} className="flex justify-between items-center p-3 border rounded">
                  <div>
                    <p className="font-medium">{cost.month_year}</p>
                    <p className="text-sm text-muted-foreground">
                      {cost.supabase_storage_gb.toFixed(2)} GB storage • {cost.supabase_bandwidth_gb.toFixed(2)} GB bandwidth
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="font-bold">${cost.total_cost.toFixed(2)}</p>
                    <p className="text-sm text-muted-foreground">total</p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </Layout>
  );
};
