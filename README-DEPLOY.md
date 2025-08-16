🚀 Deploy Rápido
🔧 Backend

Defina as variáveis de ambiente no provider:

JWT_SECRET → use uma chave forte em produção.

PORT → porta de execução (normalmente 3000 ou fornecida pelo provider).

Configure o deploy no Render ou Railway, apontando diretamente para este repositório.

Certifique-se de que o diretório uploads/ seja persistente no provider ou ajuste para usar S3 / Cloud Storage para armazenamento de imagens.

🌐 Frontend

Publique a pasta /public no GitHub Pages.

Pode ser via branch gh-pages ou configurando /public como root da branch main.

No arquivo public/app.js, ajuste a constante API para apontar para a URL pública do backend.

⚠️ Observações Importantes

Em produção, use um JWT_SECRET forte e único.

O backend deve rodar sempre em HTTPS (Render/Railway já oferecem isso automaticamente).

Para uploads de arquivos confiáveis, considere migrar de filesystem local (uploads/) para um serviço como Amazon S3, Google Cloud Storage ou Supabase Storage.