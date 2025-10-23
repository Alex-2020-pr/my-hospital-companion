import { Layout } from "@/components/Layout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Download, Search, FileText, Receipt, Shield, Pill, Trash2 } from "lucide-react";
import { useState, useEffect } from "react";
import { DocumentUploadDialog } from "@/components/DocumentUploadDialog";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { toast } from "sonner";

export const Documents = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [documents, setDocuments] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();

  const fetchDocuments = async () => {
    if (!user) return;
    
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('documents')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (error) throw error;

      // Transformar os dados do Supabase para o formato esperado
      const formattedDocs = data?.map(doc => ({
        id: doc.id,
        name: doc.title,
        type: doc.type,
        doctor: doc.description || 'Documento anexado pelo paciente',
        date: new Date(doc.document_date).toLocaleDateString('pt-BR'),
        uploadDate: new Date(doc.created_at).toLocaleDateString('pt-BR'),
        status: doc.status,
        file_url: doc.file_url,
        file_size: doc.file_size
      })) || [];

      setDocuments(formattedDocs);
    } catch (error) {
      console.error('Erro ao buscar documentos:', error);
      toast.error('Erro ao carregar documentos');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDocuments();
  }, [user]);

  const getDocumentIcon = (type: string) => {
    switch (type) {
      case 'receita':
        return Pill;
      case 'atestado':
        return Shield;
      case 'laudo':
        return FileText;
      case 'relatorio':
        return Receipt;
      default:
        return FileText;
    }
  };

  const getDocumentTypeColor = (type: string) => {
    switch (type) {
      case 'receita':
        return 'bg-green-100 text-green-800';
      case 'atestado':
        return 'bg-blue-100 text-blue-800';
      case 'laudo':
        return 'bg-purple-100 text-purple-800';
      case 'relatorio':
        return 'bg-orange-100 text-orange-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getDocumentTypeName = (type: string) => {
    switch (type) {
      case 'receita':
        return 'Receita';
      case 'atestado':
        return 'Atestado';
      case 'laudo':
        return 'Laudo';
      case 'relatorio':
        return 'Relatório';
      default:
        return 'Documento';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'válida':
      case 'válido':
      case 'disponível':
        return 'default';
      case 'expirada':
      case 'expirado':
        return 'destructive';
      default:
        return 'secondary';
    }
  };

  const handleDeleteDocument = async (documentId: string) => {
    if (!confirm('Tem certeza que deseja excluir este documento?')) {
      return;
    }

    try {
      const { error } = await supabase
        .from('documents')
        .delete()
        .eq('id', documentId)
        .eq('user_id', user?.id);

      if (error) throw error;

      toast.success('Documento excluído com sucesso');
      fetchDocuments();
    } catch (error) {
      console.error('Erro ao excluir documento:', error);
      toast.error('Erro ao excluir documento');
    }
  };

  const filteredDocuments = documents.filter(doc =>
    doc.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    doc.doctor?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    getDocumentTypeName(doc.type).toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <Layout title="Documentos">
      <div className="p-4 space-y-4">
        {/* Barra de Pesquisa */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Buscar documentos..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-9"
          />
        </div>

        {/* Lista de Documentos */}
        <div className="space-y-3">
          {filteredDocuments.map((document) => {
            const Icon = getDocumentIcon(document.type);
            
            return (
              <Card key={document.id} className="w-full">
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between">
                    <div className="flex items-start space-x-3">
                      <div className="p-2 bg-primary/10 rounded-lg">
                        <Icon className="h-5 w-5 text-primary" />
                      </div>
                      <div className="space-y-1">
                        <CardTitle className="text-base">{document.name}</CardTitle>
                        <div className="flex items-center gap-2">
                          <Badge variant="outline" className={getDocumentTypeColor(document.type)}>
                            {getDocumentTypeName(document.type)}
                          </Badge>
                          <Badge variant={getStatusColor(document.status)}>
                            {document.status.charAt(0).toUpperCase() + document.status.slice(1)}
                          </Badge>
                        </div>
                      </div>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="text-sm text-muted-foreground">
                    <p><strong>Médico:</strong> {document.doctor}</p>
                    <p><strong>Data do Documento:</strong> {document.date}</p>
                    {document.uploadDate && (
                      <p><strong>Data de Envio:</strong> {document.uploadDate}</p>
                    )}
                    {document.validUntil && (
                      <p><strong>Válida até:</strong> {document.validUntil}</p>
                    )}
                    {document.days && (
                      <p><strong>Período:</strong> {document.days}</p>
                    )}
                  </div>

                  {document.status === 'expirada' && (
                    <div className="bg-destructive/10 p-3 rounded-lg border border-destructive/20">
                      <p className="text-sm text-destructive font-medium">
                        ⚠️ Este documento está expirado
                      </p>
                    </div>
                  )}

                  <div className="flex gap-2 pt-2">
                    {document.file_url && (
                      <>
                        <Button 
                          variant="outline" 
                          size="sm" 
                          className="flex-1"
                          onClick={() => window.open(document.file_url, '_blank')}
                        >
                          <FileText className="h-4 w-4 mr-2" />
                          Visualizar
                        </Button>
                        <Button 
                          variant="default" 
                          size="sm" 
                          className="flex-1"
                          onClick={() => {
                            const link = document.createElement('a');
                            link.href = document.file_url;
                            link.download = document.name;
                            link.click();
                          }}
                        >
                          <Download className="h-4 w-4 mr-2" />
                          Download
                        </Button>
                      </>
                    )}
                    <Button 
                      variant="destructive" 
                      size="sm"
                      onClick={() => handleDeleteDocument(document.id)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>

                  {document.type === 'receita' && document.status === 'válida' && (
                    <Button variant="secondary" size="sm" className="w-full">
                      Ver Orientações de Uso
                    </Button>
                  )}
                </CardContent>
              </Card>
            );
          })}
        </div>

        {loading && (
          <div className="text-center py-8">
            <p className="text-muted-foreground">Carregando documentos...</p>
          </div>
        )}

        {!loading && filteredDocuments.length === 0 && (
          <div className="text-center py-8">
            <FileText className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <p className="text-muted-foreground">
              {searchTerm ? 'Nenhum documento encontrado.' : 'Nenhum documento disponível.'}
            </p>
          </div>
        )}

        {/* Botão para anexar documento */}
        <Card className="border-primary/20 bg-primary/5">
          <CardContent className="pt-4">
            <div className="text-center space-y-3">
              <h3 className="font-medium text-primary">Anexar Documento</h3>
              <p className="text-sm text-muted-foreground">
                Anexe receitas de consultas externas ou outros documentos médicos (até 2MB)
              </p>
              <DocumentUploadDialog onUploadSuccess={fetchDocuments} />
            </div>
          </CardContent>
        </Card>

        {/* Botão para solicitar segunda via */}
        <Card className="border-primary/20 bg-primary/5">
          <CardContent className="pt-4">
            <div className="text-center space-y-2">
              <h3 className="font-medium text-primary">Precisa de um documento?</h3>
              <p className="text-sm text-muted-foreground">
                Solicite segunda via de receitas, atestados ou laudos
              </p>
              <Button variant="outline" className="w-full">
                Solicitar Segunda Via
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </Layout>
  );
};