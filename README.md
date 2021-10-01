# Wordcloud 3

Biblioteca para geração de nuvem de palavras utilizando **canvas 2D**, baseada na biblioteca [wordcloud2.js](https://timdream.org/wordcloud2.js/).

## Características

Além das funcionalidades disponíveis na biblioteca **wordcloud2.js**, algumas melhorias foram acrescentadas:

- Destaque (*highlight*) de palavras no evento `mouseover`;
- Responsividade;
- Tooltips customizáveis, utilizando [Tippy.js](https://atomiks.github.io/tippyjs/);
- Novo tratamento de eventos: `onClick`, `onMouseover`, `onMouseout` e `onWordcloudStop`;
- Ordenação opcional dos termos pelo valor;
- Escala automática dos tamanhos de fonte (configurável), utilizando [D3 scaleLinear](https://github.com/d3/d3-scale#linear-scales).

## Instalação

Baixe o arquivo de produção da biblioteca que está localizado no diretório [`/dist`](/dist) e acrescente-o à `HEAD` da página. 

```html
<head>
  ...
  <script src="wordcloud.min.js"></script>
  ...
</head>
```

## Utilização

Inclua uma `DIV` no local desejado da página, especificando o `id` desejado e suas largura (*width*) e altura (*height*).

Ao final do corpo da página insira o script de chamada da biblioteca.

```html
<body>
  <style>
    #main {
      width: 100%;
      height: 100%;
    }
  </style>
  <div id='main'></div>
  <script>
    const data = [
      { name: 'teste', value: 100 },
      { name: 'outro', value: 50 }
    ];
    // Gerando a nuvem
    const wordcloud = Wordcloud('main', { data });
  </script>
</body>
```

## API

```javascript
const wordcloud = Wordcloud(container, options);
```

`container` é o elemento HTML onde a nuvem será impressa. Pode ser um elemento HTML, como o retornado por `document.getElementById('main')`, ou simplesmente o ID do elemento: `'main'`.

`options` é um objeto que, além da propriedade `data` (Array com as palavras e seus valores), pode conter outras propriedades de configuração da nuvem de palavras e manipulação de eventos.

A chamada da função `Wordcloud(container, options)` retorna um objeto que pode ser utilizado para gerenciar algumas características da instância.

### Propriedades do objeto retornado

| Propriedade | Tipo | Descrição |
| ----------- | ---- | --------- |
| `drawer` | `function` | Instância da biblioteca de layout e impressão ([wordcloud2.js](https://github.com/timdream/wordcloud2.js/blob/gh-pages/API.md)). Pode ser utilizada, por exemplo, para interromper a impressão da nuvem: `wordcloud.drawer.stop()` |
| `data` | `array` | Array de objetos das palavras com dados incluídos pela biblioteca. |
| `dispose` | `function` | Função que interrompe a impressão da nuvem de palavras, desconecta o ResizeObserver do container HTML e remove os elementos canvas. |
| `observer` | `object` | Instância do objeto ResizeObserver, que monitora o redimensionamento do container HTML. Pode ser utilizado para desconectar o observador: `wordcloud.observer.disconnect()` |
| `highlight` | `function` | Função que ativa ou desativa o destaque de uma palavra por meio do seu índice: `wordcloud.highlight(wordIndex)`. Informe `null` para limpar qualquer destaque na nuvem. |
| `visibility` | `function` | Função para habilitar ou desabilitar a impressão de palavras na nuvem por meio do seu índice ou uma *Array* de índices: `wordcloud.visibility(wordIndexes, visibility)`. O argumento `wordIndexes` pode ser um único índice `1` ou uma *Array* `[1, 3]`. O argumento `visibility` é um *boolean* que indica o status de visibilidade a ser aplicado. |
| `resetVisibility` | `function` | Função utilizada para resetar os status de visibilidade de todas as palavras para `true`. |
| `setOption` | `function` | Função utilizada para alterar alguma configuração na instância: `wordcloud.setOption({ fontSizeRange: [10, 50] })`. Essa função dispara o recarregamento da nuvem com a nova configuração. |
| `getOption` | `function` | Função utilizada para recuperar alguma configuração na instância ou todas se o argumento não for informado: `wordcloud.getOption('fontSizeRange')`. O argumento é o nome da propriedade a ser retornada. |
| `tooltip` | `object` | Objeto de controle das tooltips: `{ show(data, format), hide() }`. Onde `format` é uma *callback* de formatação do conteúdo da tooltip, que recebe `data` como argumento. |

### Propriedades do objeto `options`

| Propriedade | Descrição |
| ----------- | --------- |
| `data` | Array com os dados das palavras a serem exibidas na nuvem de palavras. Cada palavra é um objeto da Array, no formato `{ name, value, color, outros... }`. Apenas as propriedades `name` e `value` são obrigatórias, `color` é opcional e se não for informado, uma cor randômica será utilizada, os demais dados podem ser utilizados nas *callbacks* dos eventos disponíveis (`onClick`, `onMouseover` etc). |
| `shape` | Forma da nuvem de palavras. As opções disponíveis são:  `circle`, `cardioid`, `diamond`, `square`, `triangle-forward`, `triangle`, `pentagon`, e `star`. Valor padrão: `'circle'`. |
| `shuffle` | Faz com que o resultado de impressão da nuvem (posições) seja diferente a cada execução. Valor padrão: `false`. |
| `maskImage` | Caminho da imagem a ser utilizada como máscara para geração da nuvem. Valor padrão: `null`. |
| `fontFamily` | Fonte utilizada para impressão das palavras na nuvem. Valor padrão: `'sans-serif'`. |
| `fontWeight` | Peso a ser utilizado na fonte. Pode ser, por exemplo, `normal`, `bold`, `600` ou uma função `callback(word, weight, fontSize, extraData)`. Valor padrão: `'bold'`. |
| `fontSizeRange` | Extensão para os tamanhos mínimo e máximo das palavras. Array no formato `[min, max]`. Valor padrão: `[5, 80]`. |
| `hoverColor` | Cor da palavra (formato CSS) quando destacada (evento `mouseover`). Valor padrão: `'#000'`. |
| `hoverShadow` | Habilita ou desabilita a aplicação de sombra à palavra destacada (evento `mouseover`). Valor padrão: `true`. |
| `hoverShadowColor` | Cor da sombra (formato CSS) aplicada à palavra destacada (evento `mouseover`). Valor padrão: `'rgba(0,0,0,0.2)'`. |
| `hoverShadowBlur` | Nível de enevoamento (em pixels) da sombra aplicada à palavra destacada (evento `mouseover`). Valor padrão: `5`. |
| `hoverLineWidth` | Espessura do contorno (em pixels) aplicado à palavra destacada (evento `mouseover`). O valor informado se aplica à maior palavra e é proporcionalmente diminuído para as palavras menores. Valor padrão: `5`. |
| `hoverStrokeStyle` | Cor do contorno (formato CSS) aplicado à palavra destacada (evento `mouseover`). Valor padrão: `'#FFF'`. |
| `drawOutOfBound` | Permite que a impressão das palavras exceda parcialmente os limites da área (canvas). Valor padrão: `false`. |
| `sort` | Habilita ou desabilita a ordenação das palavras pelo seu valor (`value`) de forma decrescente, imprimindo as maiores primeiro. Valor padrão: `true`. |
| `tooltip` | Habilita ou desabilita a exibição de tooltip quando a palavra está sob o cursor do mouse. `true` habilita a tooltip padrão, `false` desabilita. Essa propriedade também pode receber uma função de formatação que retorna o HTML da tooltip: `callback(wordData)`. Valor padrão: `true`. |
| `interactive` | Habilita ou desabilita a interatividade da nuvem (mouseover, click e tooltip). Valor padrão: `true`. |
| `responsive` | Habilita ou desabilita a responsividade da nuvem quando a janela é redimensionada. Valor padrão: `true`. |
| `backgroundColor` | Cor de fundo (formato CSS) da nuvem de palavras. Valor padrão: `'rgba(255,255,255,0)'`. |
| `minRotation` | Se a palavra deve girar, a rotação mínima (em raio) que o texto deve girar. Valor padrão: `0`. |
| `maxRotation` | Se a palavra deve girar, a rotação máxima (em raio) que o texto deve girar. Valor padrão: `0`. |
| `rotationSteps` | Força o uso de um número definido de ângulos. Definir o valor igual a `2` em uma faixa de `-90°/90°` significa que apenas `-90`, `0` ou `90` serão usados. Valor padrão: `0`. |
| `rotateRatio` | Probabilidade de rotação da palavra. Defina como `1` para sempre girar. Valor padrão: `0.1`. |
| `wait` | Tempo em milissegundos a aguardar antes de começar a desenhar o próximo item usando `setTimeout`. Valor padrão: `0`. |
| `color` | Cor do texto (formato CSS) ou uma função `callback(word, weight, fontSize, distance, theta, extraDataArray)`. Também pode ser utilizada uma das paletas embutidas na biblioteca *wordcloud2*: `random-dark` e `random-light`. Valor padrão: cor randômica ou especificada em cada palavra na propriedade `color`. |
| `onClick` | Função executada quando uma palavra é clicada. Formato: `callback(wordData)`. |
| `onMouseover` | Função executada quando o mouse está sobre uma palavra. Formato: `callback(wordData)`. |
| `onMouseout` | Função executada quando o mouse deixa de sobrepor uma palavra. Formato: `callback(wordData)`. |
| `onWordcloudStop` | Função executada ao término da impressão total da nuvem de palavras. Formato: `callback({ plottedWords, data })`. Como o algoritmo pode eventualmente descartar algumas palavras da impressão (por impossibilidade de posicioná-las), a propriedade `plottedWords` traz o número de palavras que foram incluídas na impressão da nuvem. `data` traz uma Array com todas as palavras e acrescenta em cada palavra as propriedades `color` (quando gerada randômicamente) e `draw` que indica se a palavra foi incluída (`true`) ou descartada (`false`) da impressão. |
| `log` | Habilita ou desabilita a impressão de logs da biblioteca no console do navegador. Valor padrão: `true`. |

> A tabela acima contém apenas as principais opções abordadas por essa versão da biblioteca, para outras opções consulte [wordcloud2.js APIs](https://github.com/timdream/wordcloud2.js/blob/gh-pages/API.md).

## Desenvolvimento

Essa biblioteca foi desenvolvida utilizando [webpack](https://webpack.js.org/) para o empacotamento.

```bash
# Dependências
$ npm install

# Servidor de desenvolvimento (localhost:9000)
# Roda o 'index.html' do diretório '/dist'
$ npm start

# Build de produção
$ npm run build
```

> O comando `npm run build` irá gerar os arquivos `wordcloud.min.js`, `wordcloud.min.js.map` e `wordcloud.min.js.LICENSE.txt` no diretório [`/dist`](/dist).

## License

MIT &copy; Rogério Castro
