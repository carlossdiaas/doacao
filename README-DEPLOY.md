Deploy rápido

Backend
- Defina variáveis de ambiente: JWT_SECRET, PORT
- Configure deploy em Render/Railway apontando para este repositório.
- Certifique-se de que o diretório `uploads/` seja persistente no provider ou ajuste para usar S3/Cloud storage.

Frontend
- Publique a pasta `public/` no GitHub Pages (branch gh-pages ou main com /public configurado).
- Ajuste `API` em `public/app.js` para a URL pública do backend.

Observações
- Para produção, use JWT_SECRET forte e habilite HTTPS (Render/Railway já provê).
- Considerar troca de storage de arquivos para S3 ou serviço similar para persistência.
