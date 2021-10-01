/**
 * Retorna a extensão de uma array numérica.
 *
 * @param {Number[]} values - Iterável com os elementos a serem verificados.
 * @param {Function} valueof - Função accessor para cada elemento.
 *
 * @returns {array} Array com dois elementos, valor máximo e mínimo, respectivamente.
 */
export function extent(values, valueof) {
  let min;
  let max;
  if (valueof === undefined) {
      for (const value of values) {
          if (value != null) {
              if (min === undefined) {
                  if (value >= value) min = max = value;
              } else {
                  if (min > value) min = value;
                  if (max < value) max = value;
              }
          }
      }
  } else {
      let index = -1;
      for (let value of values) {
          if ((value = valueof(value, ++index, values)) != null) {
              if (min === undefined) {
                  if (value >= value) min = max = value;
              } else {
                  if (min > value) min = value;
                  if (max < value) max = value;
              }
          }
      }
  }
  return [min, max];
};

export function updateCanvasMask (maskCanvas) {
  const ctx = maskCanvas.getContext('2d')
  const imageData = ctx.getImageData(0, 0, maskCanvas.width, maskCanvas.height)
  const newImageData = ctx.createImageData(imageData)

  let toneSum = 0
  let toneCnt = 0
  for (let i = 0; i < imageData.data.length; i += 4) {
    const alpha = imageData.data[i + 3]
    if (alpha > 128) {
      const tone = imageData.data[i] + imageData.data[i + 1] + imageData.data[i + 2]
      toneSum += tone
      ++toneCnt
    }
  }
  const threshold = toneSum / toneCnt

  for (let i = 0; i < imageData.data.length; i += 4) {
    const tone = imageData.data[i] + imageData.data[i + 1] + imageData.data[i + 2]
    const alpha = imageData.data[i + 3]

    if (alpha < 128 || tone > threshold) {
      // Area not to draw
      newImageData.data[i] = 0
      newImageData.data[i + 1] = 0
      newImageData.data[i + 2] = 0
      newImageData.data[i + 3] = 1
    } else {
      // Area to draw
      // The color must be same with backgroundColor
      newImageData.data[i] = 255
      newImageData.data[i + 1] = 255
      newImageData.data[i + 2] = 255
      newImageData.data[i + 3] = 0
    }
  }

  ctx.putImageData(newImageData, 0, 0)
}

/**
 * Gera um cor RGB randomicamente
 * @returns Cor no formato RGB
 */
export function randomColor () {
  return 'rgb(' + [
    Math.round(Math.random() * 160),
    Math.round(Math.random() * 160),
    Math.round(Math.random() * 160)
  ].join(',') + ')'
}

/**
 * Formata um número para o padrão brasileiro, inclusive com decimais.
 *
 * @param {double} number - Número com decimais a ser formatado.
 * @param {integer} digits - Número de dígitos a serem exibidos após a vírgula.
 *
 * @returns {string} Número formatado como string para ser exibido.
 */
export function formatNumber(number, digits = 2) {
  return new Intl.NumberFormat('pt-BR', { maximumFractionDigits: digits }).format(number);
}

/**
 * Verifica o suporte do navegador ao elemento canvas
 * @returns TRUE se o navegador suporta canvas, FALSE se não
 */
export function canvasSupported () {
  const canvas = document.createElement('canvas')
  if (!canvas || !canvas.getContext) {
    return false
  }

  const ctx = canvas.getContext('2d')
  if (!ctx) {
    return false
  }
  if (!ctx.getImageData) {
    return false
  }
  if (!ctx.fillText) {
    return false
  }

  return true
}

/**
 * Aplica um debounce na execução de uma função que roda várias vezes durante um evento.
 * @param {number} ms Milissegundos para aguardar a execução da callback
 * @param {Function} fn Função callback
 * @returns Função com debounce aplicado
 */
const debounce = function(ms, fn) {
  var timer;
  return function() {
    clearTimeout(timer);
    var args = Array.prototype.slice.call(arguments);
    args.unshift(this);
    timer = setTimeout(fn.bind.apply(fn, args), ms);
  }
}

/**
 * Função para observar o redimensionamento de um elemento HTML utilizando a API ResizeObserver
 * e aplicando um debounce para evitar várias execuções durante o redimensionamento
 * @param {HTMLElement} element Elemento HTML a ser observado
 * @param {Function} fn Callback function que recebe a largura e altura do elemento { width, height }
 * @returns Retorna a instância ResizeObserver criada
 */
export function resizeObserver (element, fn) {
  /* const ro = new ResizeObserver((entries) => {
    const { width, height } = entries[0].contentRect;
    fn({ width, height });
  }) */
  const ro = new ResizeObserver(debounce(500, (entries) => {
    const { width, height } = entries[0].contentRect;
    fn({ width, height });
  }))
  ro.observe(element);
  return ro;
}
