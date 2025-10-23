import { useState, useRef } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Upload, Camera, FileText, Loader2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { toast } from "sonner";
import imageCompression from 'browser-image-compression';

export const DocumentUploadDialog = ({ onUploadSuccess }: { onUploadSuccess?: () => void }) => {
  const [open, setOpen] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [title, setTitle] = useState("");
  const fileInputRef = useRef<HTMLInputElement>(null);
  const cameraInputRef = useRef<HTMLInputElement>(null);
  const { user } = useAuth();

  const handleFileUpload = async (file: File) => {
    if (!user) {
      toast.error("Você precisa estar logado para anexar documentos");
      return;
    }

    // Validar tipo de arquivo
    const allowedTypes = ['image/jpeg', 'image/png', 'image/jpg', 'application/pdf'];
    if (!allowedTypes.includes(file.type)) {
      toast.error("Apenas arquivos JPG, PNG ou PDF são permitidos");
      return;
    }

    if (!title.trim()) {
      toast.error("Por favor, informe um título para o documento");
      return;
    }

    // Check storage limit
    const { data: profile } = await supabase
      .from('profiles')
      .select('storage_used_bytes, storage_limit_bytes')
      .eq('id', user.id)
      .single();

    if (profile) {
      const newSize = profile.storage_used_bytes + file.size;
      if (newSize > profile.storage_limit_bytes) {
        toast.error('Limite de armazenamento excedido. Entre em contato para aumentar seu espaço.');
        return;
      }
    }

    setUploading(true);

    try {
      let fileToUpload = file;
      
      // Comprimir imagem se for maior que 2MB (2097152 bytes)
      if (file.type.startsWith('image/') && file.size > 2097152) {
        toast.info("Comprimindo imagem...");
        const options = {
          maxSizeMB: 2,
          maxWidthOrHeight: 1920,
          useWebWorker: true,
        };
        
        try {
          fileToUpload = await imageCompression(file, options);
          toast.success("Imagem comprimida com sucesso!");
        } catch (compressionError) {
          console.error('Erro ao comprimir imagem:', compressionError);
          toast.error("Não foi possível comprimir a imagem. Tente com um arquivo menor.");
          return;
        }
      } else if (file.size > 2097152) {
        toast.error("O arquivo PDF deve ter no máximo 2MB");
        return;
      }

      // Upload do arquivo para o Storage
      const fileExt = fileToUpload.name.split('.').pop();
      const fileName = `${user.id}/${Date.now()}.${fileExt}`;
      
      const { error: uploadError } = await supabase.storage
        .from('patient-documents')
        .upload(fileName, fileToUpload);

      if (uploadError) throw uploadError;

      // Obter URL pública do arquivo
      const { data: { publicUrl } } = supabase.storage
        .from('patient-documents')
        .getPublicUrl(fileName);

      // Salvar metadados na tabela documents
      const { error: insertError } = await supabase
        .from('documents')
        .insert({
          user_id: user.id,
          title: title.trim(),
          description: 'Documento anexado pelo paciente',
          type: fileToUpload.type === 'application/pdf' ? 'laudo' : 'receita',
          document_date: new Date().toISOString().split('T')[0],
          file_url: publicUrl,
          file_size: fileToUpload.size,
          status: 'available'
        });

      if (insertError) throw insertError;

      toast.success("Documento anexado com sucesso!");
      setOpen(false);
      setTitle("");
      onUploadSuccess?.();
    } catch (error) {
      console.error('Erro ao fazer upload:', error);
      toast.error("Erro ao anexar documento. Tente novamente.");
    } finally {
      setUploading(false);
    }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      handleFileUpload(file);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button className="w-full" size="lg">
          <Upload className="h-5 w-5 mr-2" />
          Anexar Documento
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Anexar Documento</DialogTitle>
        </DialogHeader>
        <div className="space-y-4 pt-4">
          <div className="space-y-2">
            <Label htmlFor="title">Título do Documento *</Label>
            <Input
              id="title"
              placeholder="Ex: Receita Dr. Silva"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              disabled={uploading}
            />
          </div>

          <div className="space-y-2">
            <Label>Selecione como deseja anexar</Label>
            <div className="grid grid-cols-2 gap-3">
              <Button
                type="button"
                variant="outline"
                className="h-auto py-6 flex-col"
                onClick={() => fileInputRef.current?.click()}
                disabled={uploading}
              >
                {uploading ? (
                  <Loader2 className="h-8 w-8 mb-2 animate-spin" />
                ) : (
                  <FileText className="h-8 w-8 mb-2" />
                )}
                <span className="text-sm">Escolher Arquivo</span>
              </Button>

              <Button
                type="button"
                variant="outline"
                className="h-auto py-6 flex-col"
                onClick={() => cameraInputRef.current?.click()}
                disabled={uploading}
              >
                {uploading ? (
                  <Loader2 className="h-8 w-8 mb-2 animate-spin" />
                ) : (
                  <Camera className="h-8 w-8 mb-2" />
                )}
                <span className="text-sm">Usar Câmera</span>
              </Button>
            </div>
          </div>

          <input
            ref={fileInputRef}
            type="file"
            accept="image/jpeg,image/png,image/jpg,application/pdf"
            onChange={handleFileSelect}
            className="hidden"
          />

          <input
            ref={cameraInputRef}
            type="file"
            accept="image/*"
            capture="environment"
            onChange={handleFileSelect}
            className="hidden"
          />

          <div className="text-xs text-muted-foreground bg-muted p-3 rounded-md">
            <p className="font-medium mb-1">Informações importantes:</p>
            <ul className="list-disc list-inside space-y-1">
              <li>Tamanho máximo: 2MB (imagens maiores serão comprimidas)</li>
              <li>Formatos aceitos: JPG, PNG, PDF</li>
              <li>A câmera captura apenas imagens</li>
            </ul>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
