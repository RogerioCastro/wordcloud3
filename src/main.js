/*!
 * Wordcloud 3 1.0.0
 *
 * Copyright 2021 Rogério Castro.
 * Released under the MIT license
 */
import wordcloud2 from './wordcloud2'
import { scaleLinear, extent } from 'd3'
import * as _cloneDeep from 'lodash/cloneDeep'
import { updateCanvasMask, randomColor, resizeObserver } from './utils'
import { createTooltip } from './tooltip'
import './style.css'

/**
 * Plota a nuvem de palavras
 * @param {String|Object} element Container HTML ou ID do elemento
 * @param {Object} options Configurações e dados da nuvem de palavras
 * @returns {Object}
 */
export default function Wordcloud(element, options) {
  const canvas = document.createElement('canvas') // para plotagem da nuvem
  const highlightCanvas = document.createElement('canvas') // para plotagem de palavras no evento hover
  const plotData = new Map() // dados de plotagem de cada palavra
  const words = options?.data ? _cloneDeep(options.data) : null
  let hover = null
  let observer = null

  if (!wordcloud2.isSupported) {
    console.error('A nuvem de palavras não pode ser executada nesse navegador (sem suporte para canvas ou funções de Array)')
    return
  }
  if (!element || !canvas || !highlightCanvas) {
    console.error('Erro nos elementos HTML')
    return
  }
  if (!options || !words) {
    console.error('Sem dados para geração da nuvem')
    return
  }

  /* Pegando o container HTML */
  const container = typeof element === 'string' ? document.getElementById(element) : element

  /* Dimensões dos canvas */
  const dimension = {
    width: container.offsetWidth,
    height: container.offsetHeight
  }
  canvas.width = highlightCanvas.width = dimension.width
  canvas.height = highlightCanvas.height = dimension.height

  /* Estilização dos elementos HTML */
  container.style.overflow = 'hidden' // Evitando transbordamento dos canvas
  container.style.position = 'relative'
  highlightCanvas.style.position = 'absolute'
  highlightCanvas.style.top = 0
  highlightCanvas.style.left = 0
  highlightCanvas.style['pointer-events'] = 'none'

  /* Inserindo os canvas no container */
  container.appendChild(canvas)
  container.appendChild(highlightCanvas)

  /* Configurações padrão (sobrescritas pelas propriedades de 'options') */
  var settings = {
    list: [],
    shape: 'circle',
    shuffle: false,
    maskImage: null,
    clearCanvas: true,
    fontFamily: 'sans-serif',
    fontWeight: 'bold',
    fontSizeRange: [5, 80],
    hoverColor: '#000',
    hoverShadow: true,
    hoverShadowColor: 'rgba(0,0,0,0.2)',
    hoverShadowBlur: 5,
    hoverLineWidth: 5,
    hoverStrokeStyle: '#FFF',
    gridSize: 8,
    drawOutOfBound: false,
    sort: true,
    origin: null,
    tooltip: true,
    interactive: true,
    responsive: true,
    minSize: 0, // 0 to disable
    weightFactor: 1,
    backgroundColor: 'rgba(255,255,255,0)',
    maskGapWidth: 0.3,
    ellipticity: dimension.height / dimension.width,
    minRotation: 0,
    maxRotation: 0,
    rotationSteps: 0,
    rotateRatio: 0.1,
    wait: 0,
    hover: null,
    click: null,
    color: (word, weight, fontSize, distance, theta, extraDataArray) => {
      // Verificando se existe cor especificada para cada palavra
      const _word = words.find(w => w.index === extraDataArray[0])
      if (_word.color) {
        return _word.color
      }
      _word.color = randomColor()
      return _word.color
    },
    shrinkToFit: false,
    drawMask: false,
    maskColor: 'rgba(255,0,0,0.3)',
    maskGapWidth: 0.3,
    abortThreshold: 0, // disabled
    log: true
  }

  /* Sobrescrevendo as configurações (somente as que existem em 'settings') */
  if (options) {
    for (var key in options) {
      if (key in settings) {
        settings[key] = options[key]
      }
    }
  }

  /* Verificando se há interatividade e atribuindo os eventos */
  if (settings.interactive) {
    settings.hover = settings.interactive ? onMouseover : null
    settings.click = settings.interactive ? onClick : null
  }

  /* Iniciando a tooltip no canvas */
  let tooltip = settings.tooltip && settings.interactive ? createTooltip(canvas) : null

  /**
   * Formatando os dados
   * A Wordcloud2 aceita uma lista (array) no formato [ palavra, valor, outros dados...]
   */
  if (settings.sort) {
    words.sort((a, b) => b.value - a.value) // Maiores palavras primeiro
  }

  /* Carregando os dados */
  loadData()
  /* Imprimindo a nuvem de palavras */
  loadWordcloud()

  /**
   * Formata os dados das palavras para plotagem
   */
  function loadData () {
    try {
      // Juntando todos os índices das palavras com status de visibilidade FALSE
      const exclude = words.reduce((acc, cur) => {
        return typeof cur.visible === 'undefined' || cur.visible ? acc : [...acc, cur.index]
      }, [])
      const scaleValue = scaleLinear()
        .domain(extent(words.filter((w, i) => !exclude.includes(i)).map((d) => {
          if (typeof d.value === 'undefined' || d.value === null) {
            throw `Valor ausente ou nulo: ${d.name}`
          }
          return d.value
        })))
        .range(settings.fontSizeRange)
      settings.list = words.map((d, i) => {
        if (typeof d.name === 'undefined' || d.name === null) {
          throw `Propriedade 'name' ausente ou nula: Índice ${i}`
        }
        d.draw = false // flag que vai indicar se a palavra foi incluída na nuvem
        // flag que vai indicar se a palavra deve ou não ser impressa
        if (typeof d.visible === 'undefined') {
          d.visible = true
        }
        if (typeof d.index === 'undefined') {
          d.index = i
        }
        return [d.name, scaleValue(d.value), d.index, d.visible]
      })
    } catch (error) {
      console.error('[ERRO] Erro na leitura dos dados.', error.message || error)
    }
  }

  /**
   * Imprime a nuvem de palavras, aplicando a máscara, se for o caso
   */
  function loadWordcloud () {
    plotData.clear()
    if (settings.maskImage) {
      settings.clearCanvas = false
      const maskImage = new Image()
      maskImage.src = settings.maskImage
      maskImage.onload = () => {
        const ctx = canvas.getContext('2d')
        ctx.drawImage(maskImage, 0, 0, dimension.width, dimension.height)
        updateCanvasMask(canvas)
        wordcloud2(canvas, settings)
      }
    } else {
      wordcloud2(canvas, settings)
    }
  }

  /* Eventos */
  /**
   * Manipula o evento click nas palavras da nuvem
   * @param {Object} wordItem Dados da palavra
   */
  function onClick (wordItem) {
    if (options.onClick) {
      const word = words.find(w => w.index === wordItem[2])
      options.onClick(word)
    }
  }
  /**
   * Manipula o evento mouseover nas palavras da nuvem e plota a palavra na cor
   * preta no highlightCanvas
   * @param {Object} wordItem Dados da palavra
   * @param {Object} dimension Dados de posicionamento retornado pelo layout (não funciona corretamente)
   * @param {Object} event Objeto do evento
   */
  function onMouseover (wordItem, dimension, event) {
    if (wordItem) {
      if (wordItem[2] !== hover) {
        hover = wordItem[2]
        const word = words.find(w => w.index === hover)
        if (options.onMouseover) {
          options.onMouseover(word)
        }
        // Exibindo a tooltip, se for o caso
        if (tooltip) {
          tooltip.show(word, settings.tooltip)
        }
        canvas.style.cursor = 'pointer'
        highlight(hover)
      }
    } else {
      if (hover !== null) {
        const word = words.find(w => w.index === hover)
        if (options.onMouseout) {
          options.onMouseout(word)
        }
        // Ocultando a tooltip, se for o caso
        if (tooltip) {
          tooltip.hide()
        }
        hover = null
        canvas.style.cursor = 'default'
        highlight(hover)
      }
    }
  }
  /**
   * Função executada no evento 'wordclouddrawn' para pegar os dados de
   * plotagem de cada palavra assim que são incluídas na nuvem
   * @param {Object} e Objeto retornado pelo algoritmo de layout da nuvem
   */
  function onWordCloudDrawn (e) {
    const item = e.detail.item
    if (e.detail.drawn) {
      e.detail.drawn.gx += 0
      e.detail.drawn.gy += 0
      const word = words.find(w => w.index === item[2])
      word.draw = true
      plotData.set(item[2], {
        name: item[0],
        value: item[1],
        draw: e.detail.drawn
      })
    }
  }
  /**
   * Função executada no evento 'wordcloudstop' para indicar a finalização da nuvem
   * e retornar os dados com status de plotagem e cor gerada, se for o caso
   */
  function onWordcloudStop () {
    if (options.onWordcloudStop) {
      options.onWordcloudStop({ plottedWords: plotData.size, data: words })
    }
    settings.log && console.info('Nuvem finalizada:', plotData.size + ' palavras na nuvem')
  }
  // Aplicando os eventos
  canvas.addEventListener('wordclouddrawn', onWordCloudDrawn)
  canvas.addEventListener('wordcloudstop', onWordcloudStop)

  // Função para controlar a espessura
  const scaleLineWidth = scaleLinear()
    .domain(settings.fontSizeRange)
    .range([1, settings.hoverLineWidth])

  /* Outras funções */
  /**
   * Imprime a palavra no canvas de destaque (highlightCanvas) ou apenas
   * limpa o canvas se não houver palavra a ser destacada (wordIndex === null)
   * @param {number} wordIndex Índice da palavra
   */
  function highlight (wordIndex) {
    const ctx = highlightCanvas.getContext('2d')
    ctx.clearRect(0, 0, dimension.width, dimension.height)
    if (typeof wordIndex !== 'undefined' && wordIndex !== null) {
      const wordData = plotData.get(wordIndex)
      if (wordData) {
        ctx.save()
        ctx.imageSmoothingEnabled = false
        ctx.scale(1 / wordData.draw.info.mu, 1 / wordData.draw.info.mu)
        ctx.font = `${settings.fontWeight} ${wordData.value}px ${settings.fontFamily}`
        ctx.fillStyle = settings.hoverColor
        ctx.translate(
          (wordData.draw.gx + wordData.draw.info.gw / 2) * settings.gridSize * wordData.draw.info.mu,
          (wordData.draw.gy + wordData.draw.info.gh / 2) * settings.gridSize * wordData.draw.info.mu
        )
        if (wordData.draw.rot !== 0) {
          ctx.rotate(-wordData.draw.rot)
        }
        ctx.textBaseline = 'middle'
        // Verificando se a aplicação de sombra está habilitada
        if (settings.hoverShadow) {
          ctx.shadowColor = settings.hoverShadowColor
          ctx.shadowBlur = settings.hoverShadowBlur
        }
        // Verificando se há contorno a ser aplicado
        if (settings.hoverLineWidth) {
          ctx.lineWidth = scaleLineWidth(wordData.value)
          ctx.strokeStyle = settings.hoverStrokeStyle
          ctx.strokeText(
            wordData.name, wordData.draw.info.fillTextOffsetX * wordData.draw.info.mu,
            (wordData.draw.info.fillTextOffsetY + (wordData.value * 0.5)) * wordData.draw.info.mu
          )
          ctx.shadowBlur = 0 // aplicando a sombra apenas ao contorno
        }
        ctx.fillText(
          wordData.name, wordData.draw.info.fillTextOffsetX * wordData.draw.info.mu,
          (wordData.draw.info.fillTextOffsetY + (wordData.value * 0.5)) * wordData.draw.info.mu
        )
        ctx.restore()
      }
    }
  }
  /**
   * Para a wordcloud, desconecta o ResizeObserver e remove os canvas
   */
  function dispose () {
    wordcloud2.stop()
    if (observer) {
      observer.disconnect()
    }
    if (tooltip) {
      tooltip.destroy()
      tooltip = null
    }
    while (container.firstChild) {
      container.removeChild(container.firstChild)
    }
  }

  /**
   * Altera o status de visibilidade de uma ou mais palavras
   * @param {Number|[Number]} wordIndexes Índice ou Array de índices das palavras a serem afetadas
   * @param {Boolean} visibility indica o status de visibilidade a ser aplicado
   */
  function visibility(wordIndexes = null, visibility = true) {
    if (wordIndexes === null) {
      return
    }
    try {
      if (!Array.isArray(wordIndexes)) {
        wordIndexes = [wordIndexes]
      }
      wordIndexes.forEach(i => {
        const word = words.find(w => w.index === i)
        settings.list[i][3] = word.visible = visibility
      })
      settings.log && console.info('Reconstruindo nuvem de palavras...')
      /* Interrompendo a wordcloud2 antes da nova impressão */
      wordcloud2.stop()
      loadData()
      loadWordcloud()
    } catch (error) {
      console.error('[ERRO] Erro na alteração de visibilidade:', error.message || error)
    }
  }

  /**
   * Reseta todos os status de visibilidade das palavras
   */
  function resetVisibility() {
    try {
      words.forEach(w => w.visible = true)
      settings.log && console.info('Reconstruindo nuvem de palavras...')
      /* Interrompendo a wordcloud2 antes da nova impressão */
      wordcloud2.stop()
      loadData()
      loadWordcloud()
    } catch (error) {
      console.error('[ERRO] Erro na alteração de visibilidade:', error.message || error)
    }
  }

  /**
   * Altera uma configuração e recarrega a nuvem de palavras
   * @param {Object} option Configurações e seus valores a serem aplicados ao settings
   */
  function setOption(option) {
    if (typeof option !== 'object') {
      return
    }
    for (var key in option) {
      if (key in settings) {
        settings[key] = option[key]
      }
    }
    wordcloud2.stop()
    loadData()
    loadWordcloud()
  }

  /**
   * Recupera uma configuração ou todas se nenhum argumento for informado
   * @param {String} option Configuração a ser retornada ou NULL para retorno de todas
   * @returns Valor da configuração solicitada
   */
  function getOption(option = null) {
    if (!option) {
      return settings
    }
    if (option in settings) {
      return settings[option]
    }
  }

  /* Tratando o comportamento da tooltip no mouseout do canvas */
  if (tooltip) {
    canvas.addEventListener('mouseout', () => tooltip.hide())
  }

  /**
   * Monitorando o redimensionamento do container da nuvem e refazendo-a
   */
   if (settings.responsive) {
    observer = resizeObserver(container, ({ width, height }) => {
      if ((dimension.width !== width || dimension.height !== height) && (width > 0 && height > 0)) {
        settings.log && console.info('Redimensionando nuvem de palavras...')
        /* Interrompendo a wordcloud2 */
        wordcloud2.stop()
        /* Dimensões dos canvas */
        dimension.width = width
        dimension.height = height
        canvas.width = highlightCanvas.width = dimension.width
        canvas.height = highlightCanvas.height = dimension.height
        settings.ellipticity = dimension.height / dimension.width
        // Limpando os canvas
        const ctx1 = canvas.getContext('2d')
        const ctx2 = highlightCanvas.getContext('2d')
        ctx1.clearRect(0, 0, dimension.width, dimension.height)
        ctx2.clearRect(0, 0, dimension.width, dimension.height)
        loadWordcloud()
      }
    })
  }

  return {
    drawer: wordcloud2,
    data: words,
    dispose,
    observer,
    setOption,
    getOption,
    highlight,
    visibility,
    resetVisibility,
    tooltip
  }
}
