# Relatório de refatoração

## Problema e escopo

Minha Estante ajuda quem já possui livros a conferir rapidamente um título antes de comprar. A busca tem prioridade na tela. O cadastro exige apenas título e autor. Remoção com confirmação permite corrigir registros. Uma lista de leitura teria aproveitado o campo de status antigo, mas exigiria um fluxo de atualização e mudaria o foco da demonstração.

## O que mudou

| Área e código | Antes | Implementação e motivo | Alternativa | Verificação |
| --- | --- | --- | --- | --- |
| Dados · src/App.tsx e src/services/storage.ts | Axios chamava um endereço fixo do CrudCrud para listar, cadastrar e remover. | A coleção passa a ser um JSON em localStorage. O módulo de armazenamento concentra leitura e gravação. O projeto removeu Axios e a configuração fixa. | Usar localStorage diretamente no App exigiria menos um arquivo. Uma API configurável permitiria compartilhar dados, com a contrapartida de configurar e manter um serviço. | Teste com armazenamento em memória grava, relê, busca, remove e relê novamente. |
| Tipos · src/types/book.ts e isBook | O tipo misturava campos de entrada e um _id opcional fornecido pelo servidor. | BookDraft representa a entrada. Book exige id. A leitura valida o JSON e detecta IDs repetidos. | Uma asserção de tipo seria mais curta. Ela não checa o conteúdo recebido em tempo de execução. | Testes de registros válidos, JSON inválido, formato incompleto e IDs repetidos. |
| Cadastro · BookForm e updateCollection | Campos vazios falhavam em silêncio. O formulário limpava os dados sem aguardar o POST. | Os valores são aparados com trim. Cada campo inválido tem mensagem e o primeiro recebe foco. O retorno booleano de onAdd decide se os campos são limpos. | required sozinho simplificaria o código, mas aceita espaços e deixa a mensagem a cargo do navegador. | A limpeza de dados e o erro de armazenamento foram testados nos módulos. Envio por teclado, mensagens de campos vazios e foco no título foram verificados no navegador. |
| Busca · searchBooks e App | Só existia a lista completa. | O termo filtra título e autor a cada mudança. A consulta ignora caixa e acentos. | includes com toLowerCase seria suficiente para caixa, mas exigiria lembrar os acentos. | Testes cobrem título, autor, consulta vazia e ausência de resultados. |
| Remoção · removeBook e BookItem | A remoção chamava DELETE de imediato. | A confirmação nativa precede a gravação. Em caso de sucesso, o foco volta à busca. | Um diálogo próprio permitiria personalização e exigiria controle adicional de foco. | A persistência da remoção passou em teste. A remoção persistiu após recarregar e o foco voltou para a busca. Cancelar a confirmação manteve o livro na coleção após recarregar. |
| Interface · App.module.css, BookForm.module.css, BookList.module.css e index.html | O formulário ocupava uma linha com estilos globais. A interface em português declarava idioma inglês. | Uma coluna em telas estreitas e duas colunas em telas largas. O idioma é pt-BR. CSS Modules delimita os estilos e CSS global mantém a base dos controles. | Um único arquivo de estilos seria suficiente no início. Os módulos aproximam os seletores dos componentes. | Build e lint passaram. A busca e o formulário foram revisados em 1280 px e 360 px. Tab e Enter foram usados no fluxo de cadastro. |

## Caminho dos dados

Ao abrir a página, useState(readCollection) chama a função que lê o armazenamento. loadBooks converte o JSON e valida o formato antes de devolver os livros. App guarda a coleção em estado. A lista visível é calculada de novo a cada renderização usando os livros e o texto da busca.

Em BookForm, cada onChange atualiza o rascunho. No envio, preventDefault evita a navegação padrão do formulário. O rascunho limpo segue para onAdd. App gera um id, monta uma nova coleção e chama updateCollection. Se saveBooks concluir, o novo estado volta para BookList e a busca é limpa para revelar o registro. Se falhar, a coleção anterior e o rascunho continuam disponíveis.

### Gravar antes de atualizar a interface

Trecho de updateCollection em src/App.tsx.

```tsx
saveBooks(window.localStorage, next);
setCollection({ books: next, readFailed: false });
setWriteFailed(false);
setMessage(success);
return true;
```

1. saveBooks serializa a coleção e chama setItem. Se o armazenamento falhar, a exceção pula para o catch.
2. setCollection troca a coleção renderizada depois da gravação.
3. setWriteFailed(false) limpa a sinalização de falha anterior.
4. setMessage(success) fornece o texto da confirmação.
5. return true sinaliza ao formulário que os campos podem ser limpos.

Para reproduzir em um exemplo menor, crie um contador com um botão. Dentro de try, grave o próximo valor com setItem e só depois chame setCount. No catch, exiba o erro sem trocar o valor.

### Validar dados de fora do TypeScript

Trecho de loadBooks em src/services/storage.ts.

```ts
const data: unknown = JSON.parse(raw);
if (!Array.isArray(data) || !data.every(isBook)) {
  throw new Error("Formato inválido da coleção.");
}
```

1. unknown exige verificar o valor obtido antes de tratá-lo como coleção.
2. Array.isArray verifica o contêiner e every chama isBook para cada entrada. O retorno value is Book descreve a garantia dada pela função após conferir as propriedades.
3. A exceção leva ao estado de erro de leitura. Nesse estado, o formulário não aparece, evitando que uma coleção inválida seja sobrescrita.

Para praticar, converta um JSON em unknown e use typeof para aceitar somente números. Compare o resultado com um valor convertido com as number. A asserção muda a informação do compilador, mas não verifica o dado.

### Buscar sem acentos

Trecho de normalize em src/services/catalog.ts.

```ts
return value.normalize("NFD").replace(/\p{M}/gu, "").toLowerCase();
```

normalize separa letras e marcas combinantes. replace remove as marcas e toLowerCase elimina a diferença entre maiúsculas e minúsculas. searchBooks aplica a mesma transformação ao termo e aos campos. O título original continua preservado na tela. Para reproduzir, aplique a expressão a “Brás” e compare o resultado com “bras”.

## Testes e limites da verificação

- npm run lint e npm run build concluíram com sucesso. O build exibiu um aviso de tempo de processamento dos plugins de CSS.
- npm run test:coverage passou em cinco testes. A cobertura informada pelo Node foi de 100% de linhas, funções e ramos em src/services/catalog.ts e src/services/storage.ts.
- Os testes injetam um objeto com getItem e setItem para reproduzir uma coleção nova, gravação, releitura, remoção e exceções. Nenhum navegador é necessário para repetir esses casos.
- Com o Vite em localhost, o navegador integrado abriu a aplicação. Foram verificados o estado inicial, o envio por teclado, as mensagens de campos obrigatórios, o foco no primeiro campo inválido, a busca com e sem correspondência e a persistência real do cadastro e da remoção. As capturas de desktop e celular estão no README. Em um teste posterior, o cancelamento preservou o livro após recarregar. Um cadastro com 6.291.456 caracteres no campo Autor excedeu a cota do armazenamento do navegador. A interface mostrou a mensagem de erro, preservou os dois campos e manteve o livro anterior. Após recarregar, o cadastro que falhou continuou ausente. O livro de teste foi removido e a estante permaneceu vazia após nova recarga.

### Roteiro para repetir e complementar a validação no navegador

1. Abra a aplicação em um perfil de teste e confirme a mensagem de coleção vazia. Envie o formulário em branco e depois com espaços. Confira as mensagens e o foco no primeiro campo inválido.
2. Cadastre Memórias Póstumas de Brás Cubas, recarregue e procure por bras cubas e machado. Digite um termo inexistente e confira o estado sem resultados.
3. Simule falha de escrita no console com Storage.prototype.setItem = () => { throw new Error("Falha simulada"); }. Envie o formulário e confira a mensagem, os campos preservados e a lista intacta. Recarregue para restaurar o comportamento normal.
4. Cancele e depois confirme a remoção. Recarregue para verificar a persistência. Repita o fluxo usando Tab, Enter e Espaço, conforme o controle.
5. Confira a interface em larguras de 360 px e 1280 px, com títulos longos. Capture as duas versões com uma coleção de exemplo.

## Apresentação em entrevista

1. Explique a situação no sebo e abra a busca.
2. Cadastre o livro de exemplo, recarregue e encontre-o sem digitar os acentos.
3. Abra BookForm e updateCollection. Mostre onde os campos são validados e em que ponto a tela muda.
4. Rode npm run test:coverage e mostre o teste que grava, relê e busca.
5. Explique o limite de dispositivo e navegador. Cite edição e sincronização como melhorias futuras que exigem fluxos adicionais.

**Por que localStorage?** O catálogo é pessoal e pequeno. Em storage.ts, getItem e setItem resolvem a recarga sem uma API. Sincronizar aparelhos exigiria persistência compartilhada.

**Por que a busca não tem outro useState para os resultados?** App calcula results a partir de books e query. Guardar a lista filtrada criaria um segundo estado para sincronizar.

**O que acontece se o armazenamento falhar?** updateCollection só troca a coleção depois de saveBooks. O catch informa a falha e retorna false. BookForm conserva os campos porque só os limpa quando onAdd retorna true.

**Por que um identificador separado do título?** Títulos podem se repetir. BookList usa id como chave e removeBook filtra pelo mesmo id, removendo apenas o registro selecionado.

**O que a cobertura mede?** Mede os dois módulos de lógica. Os testes exercitam o armazenamento por um objeto em memória. Layout, teclado e o armazenamento real precisam de validação no navegador.
