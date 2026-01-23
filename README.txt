Gerador de Curriculo (PT-BR) — 2 colunas, PDF e DOCX

O que este projeto faz:
- Gerador de curriculo 100% estatico (HTML/CSS/JS).
- Preview profissional em 2 colunas.
- 3 temas (Moderno, Minimalista, Classico) + tema Custom.
- Exportar PDF: usa a impressao do navegador (Salvar em PDF).
- Exportar DOCX: gera um arquivo editavel (layout simples, compatibilidade alta).
- Exportar/Importar dados do curriculo em JSON.
- Exportar/Importar tema em JSON.
- Auto-save no navegador (LocalStorage).

Como usar:
1) Abra index.html no navegador.
2) Preencha o formulario.
3) Clique em Exportar PDF ou Exportar DOCX.

GitHub Pages:
1) Crie um repo e suba os arquivos.
2) Settings -> Pages -> Deploy from a branch -> main -> /(root).
3) Acesse o link do Pages.

Observacoes importantes:
- O PDF vai sair igual ao preview (2 colunas).
- O DOCX e gerado em formato mais simples (uma coluna), para garantir compatibilidade e permitir edicao facil.
  Se voce quiser, eu posso evoluir para DOCX em 2 colunas depois.

Personalizacao:
- Os temas usam variaveis CSS no CSS (paper variables).
- Para criar um tema custom, selecione "Custom" e ajuste as cores.
- Use "Exportar tema" para baixar um JSON do tema e compartilhar.

Tecnologias:
- Sem build, sem backend.
- docx (lib JS) + file-saver para exportar DOCX.

Licenca:
- MIT (adicione se quiser).
